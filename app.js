document.addEventListener('DOMContentLoaded', function() {
    const addNoteBtn = document.getElementById('addNoteBtn');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const noteCreationForm = document.getElementById('noteCreationForm');
    const welcomeTitle = document.getElementById('welcomeTitle');
    const welcomeContent = document.getElementById('welcomeContent');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const notesList = document.getElementById('notesList');
    const noteDisplay = document.getElementById('noteDisplay');
    const displayTitle = document.getElementById('displayTitle');
    const displayBody = document.getElementById('displayBody');
    const deleteBtn = document.getElementById('deleteBtn');
    const trashIcon = document.getElementById('trashIcon');
    const trashCount = document.getElementById('trashCount');
    const trashModal = document.getElementById('trashModal');
    const closeTrashBtn = document.getElementById('closeTrashBtn');
    const deletedNotesList = document.getElementById('deletedNotesList');
    const editForm = document.getElementById('editForm');
    const editTitle = document.getElementById('editTitle');
    const editContent = document.getElementById('editContent');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const darkModeBtn = document.getElementById('darkModeBtn');
    const darkModeIcon = document.getElementById('darkModeIcon');
    const permaDeleteBtn = document.getElementById('permaDeleteBtn');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let deletedNotes = JSON.parse(localStorage.getItem('deletedNotes')) || [];
    let currentNoteId = null;
    let autoSaveTimeout = null;

    // Initialize the app
    function initApp() {
        cleanupExpiredNotes();
        renderNotesList();
        renderTrashCount();
        showWelcomeScreen();
    }

    // Clean up notes that have been in trash for more than 30 days
    function cleanupExpiredNotes() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        deletedNotes = deletedNotes.filter(note => {
            const deletedDate = new Date(note.deletedAt);
            return deletedDate > thirtyDaysAgo;
        });
        
        localStorage.setItem('deletedNotes', JSON.stringify(deletedNotes));
    }

    // Render trash count
    function renderTrashCount() {
        trashCount.textContent = deletedNotes.length;
    }

    // Render notes list in sidebar
    function renderNotesList() {
        notesList.innerHTML = '';
        notes.forEach((note, index) => {
            const noteDate = new Date(note.timestamp);
            const formattedDate = noteDate.toLocaleDateString('en-US', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            const formattedTime = noteDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            noteItem.innerHTML = `
                <h3>${note.title}</h3>
                <div class="note-content">${note.content}</div>
                <div class="note-meta">
                    <span class="note-date">${formattedDate}</span>
                    <span class="note-time">${formattedTime}</span>
                </div>
            `;
            noteItem.addEventListener('click', () => displayNote(index));
            notesList.appendChild(noteItem);
        });
    }

    // Show welcome screen
    function showWelcomeScreen() {
        welcomeScreen.style.display = 'flex';
        noteDisplay.style.display = 'none';
        currentNoteId = null;
        hideNoteCreation();
    }

    // Display a specific note
    function displayNote(index) {
        // Always close edit form if open
        hideEditForm();
        const note = notes[index];
        displayTitle.textContent = note.title;
        displayBody.textContent = note.content;
        welcomeScreen.style.display = 'none';
        noteDisplay.style.display = 'block';
        currentNoteId = index;
        
        // Update active state in sidebar
        document.querySelectorAll('.note-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
    }

    // Hide edit form and reset fields
    function hideEditForm() {
        editForm.style.display = 'none';
        editTitle.value = '';
        editContent.value = '';
    }

    // Show note creation on welcome screen
    function showNoteCreation() {
        welcomeScreen.classList.add('creating');
        noteCreationForm.style.display = 'block';
        addNoteBtn.classList.add('rotated');
        
        // Trigger animation after a brief delay
        setTimeout(() => {
            noteCreationForm.classList.add('active');
            setTimeout(() => {
                welcomeTitle.focus();
            }, 300);
        }, 50);
    }

    // Hide note creation and return to welcome message
    function hideNoteCreation() {
        welcomeScreen.classList.remove('creating');
        noteCreationForm.classList.remove('active');
        addNoteBtn.classList.remove('rotated');
        
        setTimeout(() => {
            noteCreationForm.style.display = 'none';
            welcomeTitle.value = '';
            welcomeContent.value = '';
        }, 600);
    }

    // Autosave function
    function autoSaveNote() {
        const title = welcomeTitle.value.trim();
        const content = welcomeContent.value.trim();
        
        if (title || content) {
            const newNote = {
                title: title || 'Untitled',
                content: content || '',
                timestamp: new Date().toISOString()
            };
            
            notes.unshift(newNote);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotesList();
            displayNote(0);
        }
    }

    // Deselect current note and show welcome screen
    function deselectNote() {
        currentNoteId = null;
        welcomeScreen.style.display = 'flex';
        noteDisplay.style.display = 'none';
        hideEditForm();
        hideNoteCreation();
        
        // Remove active state from all sidebar items
        document.querySelectorAll('.note-item').forEach((item) => {
            item.classList.remove('active');
        });
    }

    // Delete current note
    function deleteCurrentNote() {
        if (currentNoteId !== null) {
            hideEditForm();
            const noteToDelete = notes[currentNoteId];
            noteToDelete.deletedAt = new Date().toISOString();
            
            // Move to deleted notes
            deletedNotes.unshift(noteToDelete);
            localStorage.setItem('deletedNotes', JSON.stringify(deletedNotes));
            
            // Remove from active notes
            notes.splice(currentNoteId, 1);
            localStorage.setItem('notes', JSON.stringify(notes));
            
            // Update UI
            renderNotesList();
            renderTrashCount();
            showWelcomeScreen();
        }
    }

    // Render deleted notes in trash modal
    function renderDeletedNotes() {
        deletedNotesList.innerHTML = '';
        deletedNotes.forEach((note, index) => {
            const noteDate = new Date(note.timestamp);
            const deletedDate = new Date(note.deletedAt);
            const formattedDate = noteDate.toLocaleDateString('en-US', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
            const formattedTime = noteDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
            
            const deletedNoteItem = document.createElement('div');
            deletedNoteItem.className = 'deleted-note-item';
            deletedNoteItem.innerHTML = `
                <button class="restore-btn" data-index="${index}">
                    <span>↻</span>
                </button>
                <h3>${note.title}</h3>
                <div class="note-content">${note.content}</div>
                <div class="note-meta">
                    <span class="note-date">${formattedDate}</span>
                    <span class="note-time">${formattedTime}</span>
                </div>
            `;
            
            // Add restore functionality
            const restoreBtn = deletedNoteItem.querySelector('.restore-btn');
            restoreBtn.addEventListener('click', () => restoreNote(index));
            
            deletedNotesList.appendChild(deletedNoteItem);
        });
    }

    // Restore a deleted note
    function restoreNote(index) {
        const noteToRestore = deletedNotes[index];
        delete noteToRestore.deletedAt; // Remove deleted timestamp
        
        // Move back to active notes
        notes.unshift(noteToRestore);
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Remove from deleted notes
        deletedNotes.splice(index, 1);
        localStorage.setItem('deletedNotes', JSON.stringify(deletedNotes));
        
        // Update UI
        renderNotesList();
        renderTrashCount();
        renderDeletedNotes();
    }

    // Edit note function (global function for ondblclick)
    window.editNote = function() {
        if (currentNoteId !== null && editForm.style.display === 'none') {
            const note = notes[currentNoteId];
            editTitle.value = note.title;
            editContent.value = note.content;
            editForm.style.display = 'block';
            
            // Focus on title input
            setTimeout(() => {
                editTitle.focus();
            }, 100);
        }
    };

    // Save edited note
    function saveEditedNote() {
        if (currentNoteId !== null) {
            const title = editTitle.value.trim();
            const content = editContent.value.trim();
            
            if (title || content) {
                notes[currentNoteId].title = title || 'Untitled';
                notes[currentNoteId].content = content || '';
                notes[currentNoteId].lastModified = new Date().toISOString();
                localStorage.setItem('notes', JSON.stringify(notes));
                renderNotesList();
                displayNote(currentNoteId);
            }
        }
        hideEditForm();
    }

    // Cancel edit
    function cancelEdit() {
        hideEditForm();
    }

    // Show note creation when + button is clicked
    addNoteBtn.addEventListener('click', function() {
        if (addNoteBtn.classList.contains('rotated')) {
            // If already creating a note, cancel it
            hideNoteCreation();
        } else {
            // Start creating a new note
            showNoteCreation();
        }
    });

    // Autosave on input changes
    welcomeTitle.addEventListener('input', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(autoSaveNote, 1000); // Save after 1 second of inactivity
    });

    welcomeContent.addEventListener('input', function() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(autoSaveNote, 1000); // Save after 1 second of inactivity
    });

    // Handle Enter key in welcome title field
    welcomeTitle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            welcomeContent.focus();
        }
    });

    // Double-click near the welcome message to start a new note
    welcomeScreen.addEventListener('dblclick', function(e) {
        const centerElem = welcomeScreen.querySelector('.center-text h2');
        if (!centerElem) return;
        const rect = centerElem.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 300) {
            showNoteCreation();
        }
    });

    // Dark mode logic
    function setDarkMode(enabled) {
        if (enabled) {
            document.body.classList.add('dark-mode');
            darkModeIcon.textContent = '🌙';
            localStorage.setItem('darkMode', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            darkModeIcon.textContent = '🌞';
            localStorage.setItem('darkMode', 'false');
        }
    }

    // Toggle dark mode on button click
    darkModeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        setDarkMode(!document.body.classList.contains('dark-mode'));
    });

    // On load, set theme from localStorage
    if (localStorage.getItem('darkMode') === 'true') {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }

    // Permanently delete all notes in trash
    permaDeleteBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('Are you sure you want to permanently delete all notes in the trash? This cannot be undone.')) {
            deletedNotes = [];
            localStorage.setItem('deletedNotes', JSON.stringify(deletedNotes));
            renderDeletedNotes();
            renderTrashCount();
        }
    });

    // Delete button click handler
    deleteBtn.addEventListener('click', deleteCurrentNote);

    // Trash icon click handler
    trashIcon.addEventListener('click', function() {
        renderDeletedNotes();
        trashModal.classList.add('active');
    });

    // Close trash modal
    closeTrashBtn.addEventListener('click', function() {
        trashModal.classList.remove('active');
    });

    // Close trash modal when clicking outside
    trashModal.addEventListener('click', function(e) {
        if (e.target === trashModal) {
            trashModal.classList.remove('active');
        }
    });

    // Save button click handler
    saveBtn.addEventListener('click', saveEditedNote);

    // Cancel button click handler
    cancelBtn.addEventListener('click', cancelEdit);

    // Handle Enter key in edit title field to focus on content
    editTitle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            editContent.focus();
        }
    });

    // Prevent deselect when clicking inside note display or edit form
    noteDisplay.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    editForm.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Handle clicking outside note display to deselect
    document.addEventListener('click', function(e) {
        // Only handle if a note is currently selected and edit form is not open
        if (currentNoteId !== null && editForm.style.display === 'none') {
            const noteDisplay = document.getElementById('noteDisplay');
            const sidebar = document.querySelector('.sidebar');
            const addNoteBtn = document.getElementById('addNoteBtn');
            
            if (!noteDisplay.contains(e.target) && 
                !sidebar.contains(e.target) && 
                !addNoteBtn.contains(e.target)) {
                deselectNote();
            }
        }
    });

    // Global Escape key handler for app back navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // If edit form is open, close it
            if (editForm.style.display === 'block') {
                hideEditForm();
                return;
            }
            // If note creation is open, close it
            if (noteCreationForm.style.display === 'block') {
                hideNoteCreation();
                return;
            }
            // If trash modal is open, close it
            if (trashModal.classList.contains('active')) {
                trashModal.classList.remove('active');
                return;
            }
            // If a note is selected, deselect it
            if (currentNoteId !== null) {
                deselectNote();
                return;
            }
        }
    });

    // Initialize the app
    initApp();
});
