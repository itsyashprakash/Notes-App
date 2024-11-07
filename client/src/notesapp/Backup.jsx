import React, { useState, useRef, useEffect } from 'react';
import { 
  Folder, 
  Plus, 
  X, 
  MoreVertical, 
  FileText, 
  ChevronRight,
  Search,
  Settings,
  FolderOpen,
  Bold,
  Italic,
  Underline,
  Link,
  Highlighter,
  Type,
  List,
  ListOrdered
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FolderManagementApp = () => {
    const [folders, setFolders] = useState([]);
    const [notes, setNotes] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [newNoteName, setNewNoteName] = useState('');
    const [isRenamingFolder, setIsRenamingFolder] = useState(false);
    const [isRenamingNote, setIsRenamingNote] = useState(false);
    const [newFolderNameForRename, setNewFolderNameForRename] = useState('');
    const [newNoteNameForRename, setNewNoteNameForRename] = useState('');
  
    const createFolder = () => {
      if (newFolderName.trim() !== '') {
        const newFolder = {
          id: Date.now(),
          name: newFolderName.trim(),
        };
        setFolders([...folders, newFolder]);
        setNewFolderName('');
        setIsCreatingFolder(false);
      }
    };
  
    const createNote = () => {
      if (newNoteName.trim() !== '' && selectedFolder) {
        const newNote = {
          id: Date.now(),
          folderId: selectedFolder.id,
          name: newNoteName.trim(),
          content: '',
          createdAt: new Date().toISOString(),
        };
        setNotes([...notes, newNote]);
        setNewNoteName('');
        setIsCreatingNote(false);
      }
    };
  
    const deleteFolder = (folderId) => {
      // Remove the folder from the list of folders
      const updatedFolders = folders.filter((folder) => folder.id !== folderId);
      setFolders(updatedFolders);
    
      // Remove all notes associated with this folder
      setNotes(notes.filter((note) => note.folderId !== folderId));
    
      // Clear the selected folder if it was the deleted one
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
    };
    
    const deleteNote = (noteId) => {
      // Remove the note from the list of notes
      setNotes(notes.filter((note) => note.id !== noteId));
      
      // Clear selected note if it was the deleted one
      setSelectedNote(null);
    };
  
    const renameFolder = () => {
      if (newFolderNameForRename.trim() !== '') {
        setFolders(folders.map(folder => 
          folder.id === selectedFolder.id 
            ? { ...folder, name: newFolderNameForRename.trim() } 
            : folder
        ));
        setNewFolderNameForRename('');
        setIsRenamingFolder(false);
      }
    };
  
    const renameNote = () => {
      if (newNoteNameForRename.trim() !== '') {
        setNotes(notes.map(note => 
          note.id === selectedNote.id 
            ? { ...note, name: newNoteNameForRename.trim() } 
            : note
        ));
        setNewNoteNameForRename('');
        setIsRenamingNote(false);
      }
    };
  
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        if (isCreatingFolder) {
          createFolder();
        } else if (isCreatingNote) {
          createNote();
        } else if (isRenamingFolder) {
          renameFolder();
        } else if (isRenamingNote) {
          renameNote();
        }
      }
    };

  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [textColor, setTextColor] = useState('#000000');
  const editorRef = useRef(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && editorRef.current?.contains(selection.anchorNode)) {
        setTimeout(() => {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          setToolbarPosition({
            top: rect.bottom + window.scrollY + 10,
            left: rect.left + rect.width / 2
          });
          setShowToolbar(true);
        }, 200);
      } else {
        setShowToolbar(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const applyFormatting = (format) => {
    switch (format) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'insertUnorderedList':
      case 'insertOrderedList':
        document.execCommand(format, false, null);
        break;
      case 'highlight':
        document.execCommand('backColor', false, highlightColor);
        break;
      case 'color':
        document.execCommand('foreColor', false, textColor);
        break;
      case 'link':
        const url = prompt('Enter the URL:');
        if (url) document.execCommand('createLink', false, url);
        break;
    }
    editorRef.current?.focus();
  };

  const handleNoteContentChange = (event) => {
    if (selectedNote) {
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id ? { ...note, content: event.target.innerHTML } : note
      );
      setNotes(updatedNotes);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Primary Sidebar - Folders List */}
      <div className="w-64 border-r flex flex-col bg-muted/30">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Folders</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => setIsCreatingFolder(true)}
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create new folder</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search folders..." className="pl-8" />
          </div>

          {isCreatingFolder && (
            <div className="mt-4 flex items-center space-x-2">
              <Input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="New folder"
                className="flex-1"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCreatingFolder(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isRenamingFolder && selectedFolder && (
            <div className="mt-4 flex items-center space-x-2">
              <Input
                type="text"
                value={newFolderNameForRename}
                onChange={(e) => setNewFolderNameForRename(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Rename folder"
                className="flex-1"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsRenamingFolder(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 p-2">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`group flex items-center space-x-2 rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${selectedFolder?.id === folder.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
                onClick={() => setSelectedFolder(folder)}
              >
                {selectedFolder?.id === folder.id ? (
                  <FolderOpen className="h-4 w-4 shrink-0" />
                ) : (
                  <Folder className="h-4 w-4 shrink-0" />
                )}
                <span className="flex-1 truncate">{folder.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {notes.filter(note => note.folderId === folder.id).length}
                </Badge>

                {/* Folder Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setIsRenamingFolder(true);
                      setNewFolderNameForRename(folder.name);
                    }}>Rename</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteFolder(folder.id)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Secondary Sidebar - Notes List */}
      <div className="w-80 border-r flex flex-col bg-background">
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{selectedFolder ? selectedFolder.name : 'Select a folder'}</h3>
            {selectedFolder && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setIsCreatingNote(true)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create new note</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {isCreatingNote && (
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                value={newNoteName}
                onChange={(e) => setNewNoteName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="New note"
                className="flex-1"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsCreatingNote(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isRenamingNote && selectedNote && (
            <div className="mt-4 flex items-center space-x-2">
              <Input
                type="text"
                value={newNoteNameForRename}
                onChange={(e) => setNewNoteNameForRename(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Rename note"
                className="flex-1"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsRenamingNote(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <Separator />

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {selectedFolder && notes
              .filter(note => note.folderId === selectedFolder.id)
              .map(note => (
                <div
                  key={note.id}
                  className={`group flex justify-between items-start rounded-lg border p-4 space-y-2 transition-all duration-200 hover:bg-accent/50 hover:text-accent-foreground ${selectedNote?.id === note.id ? 'bg-accent text-accent-foreground border-accent-foreground/30' : 'border-transparent bg-background/40'}`}
                  onClick={() => setSelectedNote(note)}
                >
                  <div className="flex flex-col justify-start gap-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                      <span className="font-medium truncate text-sm">{note.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Note Actions - Three-dot icon on the right */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 p-1 hover:bg-muted/20 rounded-full ml-auto">
                        <MoreVertical className="h-4 w-4 text-muted-foreground group-hover:text-accent-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setIsRenamingNote(true);
                          setNewNoteNameForRename(note.name);
                        }}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteNote(note.id)}
                        className="text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedNote ? (
          <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">
                  {selectedNote.name}
                </h1>
              </div>
              <div
                ref={editorRef}
                contentEditable
                className="prose prose-sm max-w-none min-h-[200px] focus:outline-none"
                dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                onInput={handleNoteContentChange}
                placeholder="Start typing to add content..."
                data-placeholder="Start typing to add content..."
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p className="text-lg">
                {selectedFolder ? 'Select a note to view' : 'Select a folder to get started'}
              </p>
            </div>
          </div>
        )}

        {showToolbar && (
          <div
            ref={toolbarRef}
            className="fixed bg-white shadow-md rounded-md p-2 flex flex-wrap gap-2 transform -translate-x-1/2 z-50"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
            }}
          >
            <Button onClick={() => applyFormatting('bold')} variant="outline" size="icon">
              <Bold className="h-4 w-4" />
            </Button>
            <Button onClick={() => applyFormatting('italic')} variant="outline" size="icon">
              <Italic className="h-4 w-4" />
            </Button>
            <Button onClick={() => applyFormatting('underline')} variant="outline" size="icon">
              <Underline className="h-4 w-4" />
            </Button>
            <Button onClick={() => applyFormatting('link')} variant="outline" size="icon">
              <Link className="h-4 w-4" />
            </Button>
            <Button onClick={() => applyFormatting('highlight')} variant="outline" size="icon">
              <Highlighter className="h-4 w-4" />
            </Button>
            <Input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="w-8 h-8 p-0 border-none"
              title="Highlight color"
            />
            <Button onClick={() => applyFormatting('color')} variant="outline" size="icon">
              <Type className="h-4 w-4" />
            </Button>
            <Input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-8 p-0 border-none"
              title="Text color"
            />
            <Button onClick={() => applyFormatting('insertUnorderedList')} variant="outline" size="icon">
              <List className="h-4 w-4" />
            </Button>
            <Button onClick={() => applyFormatting('insertOrderedList')} variant="outline" size="icon">
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          cursor: text;
        }
      `}</style>
    </div>
  );
};

export default FolderManagementApp;