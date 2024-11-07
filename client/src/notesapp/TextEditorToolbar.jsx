import React, { useState, useRef, useEffect } from 'react';
import {
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

const TextEditorToolbar = ({ editorRef }) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [highlightColor, setHighlightColor] = useState('#FFFF00');
  const [textColor, setTextColor] = useState('#000000');
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
  }, [editorRef]);

  const applyFormatting = (format) => {
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');

      switch (format) {
        case 'bold':
          span.style.fontWeight = 'bold';
          break;
        case 'italic':
          span.style.fontStyle = 'italic';
          break;
        case 'underline':
          span.style.textDecoration = 'underline';
          break;
        case 'highlight':
          span.style.backgroundColor = highlightColor;
          break;
        case 'color':
          span.style.color = textColor;
          break;
        case 'link':
          const url = prompt('Enter the URL:');
          if (url) {
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.appendChild(range.extractContents());
            range.insertNode(linkElement);
            return;
          }
          break;
        case 'insertUnorderedList':
          const ul = document.createElement('ul');
          const li = document.createElement('li');
          li.appendChild(range.extractContents());
          ul.appendChild(li);
          range.insertNode(ul);
          return;
        case 'insertOrderedList':
          const ol = document.createElement('ol');
          const liOrdered = document.createElement('li');
          liOrdered.appendChild(range.extractContents());
          ol.appendChild(liOrdered);
          range.insertNode(ol);
          return;
      }

      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
    editorRef.current?.focus();
  };

  return (
    <>
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
    </>
  );
};

export default TextEditorToolbar;
