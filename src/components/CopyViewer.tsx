import React, { useState } from 'react';
import { 
  Pencil, 
  Trash2, 
  Plus, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn, 
  ZoomOut, 
  CheckCircle2,
  FileImage,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Crosshair,
  ShieldCheck,
  Download
} from 'lucide-react';
import { AnnotationItem } from '../types';
import { BookletPageData } from '../data/samplePages';

interface CopyViewerProps {
  currentPage: BookletPageData;
  currentPageIndex: number;
  totalPages: number;
  onPageChange: (index: number) => void;
  onUpdateAnnotation: (updated: AnnotationItem) => void;
  onDeleteAnnotation: (id: string) => void;
  onAddAnnotation: (annot: Omit<AnnotationItem, 'id'>) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  showTicks: boolean;
  setShowTicks: (val: boolean) => void;
  showCrosses: boolean;
  setShowCrosses: (val: boolean) => void;
  onUploadCopyImage?: (file: File) => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
}

export const CopyViewer: React.FC<CopyViewerProps> = ({
  currentPage,
  currentPageIndex,
  totalPages,
  onPageChange,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onAddAnnotation,
  zoomLevel,
  setZoomLevel,
  showTicks,
  setShowTicks,
  showCrosses,
  setShowCrosses,
  onUploadCopyImage,
  onExportPdf,
  isExportingPdf,
}) => {
  const [selectedAnnotId, setSelectedAnnotId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingType, setEditingType] = useState<AnnotationItem['type']>('suggestion');
  const [editingCheckmark, setEditingCheckmark] = useState<boolean>(false);
  const [editingCross, setEditingCross] = useState<boolean>(false);
  const [editingX, setEditingX] = useState<number>(82);
  const [editingY, setEditingY] = useState<number>(30);
  const [editingWidth, setEditingWidth] = useState<number>(16);

  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [newAnnotText, setNewAnnotText] = useState<string>('');
  const [newAnnotMargin, setNewAnnotMargin] = useState<'right' | 'left' | 'top_callout' | 'score_stamp'>('right');
  const [newAnnotY, setNewAnnotY] = useState<number>(30);
  const [newAnnotType, setNewAnnotType] = useState<AnnotationItem['type']>('suggestion');
  const [newAnnotCheckmark, setNewAnnotCheckmark] = useState<boolean>(false);
  const [newAnnotCross, setNewAnnotCross] = useState<boolean>(false);
  const [showPlacementGrid, setShowPlacementGrid] = useState<boolean>(false);

  // Quick edit trigger
  const startEdit = (annot: AnnotationItem) => {
    setSelectedAnnotId(annot.id);
    setEditingText(annot.text);
    setEditingType(annot.type);
    setEditingCheckmark(annot.hasCheckmark || false);
    setEditingCross(annot.hasCross || false);
    setEditingX(annot.xPercent);
    setEditingY(annot.yPercent);
    setEditingWidth(annot.widthPercent || 16);
  };

  const saveEdit = (annot: AnnotationItem) => {
    onUpdateAnnotation({
      ...annot,
      text: editingText,
      type: editingType,
      hasCheckmark: editingCheckmark,
      hasCross: editingCross,
      xPercent: editingX,
      yPercent: editingY,
      widthPercent: editingWidth,
      editedByUser: true,
    });
    setSelectedAnnotId(null);
  };

  const handleCreateNew = () => {
    if (!newAnnotText.trim()) return;
    
    let xPercent = 82;
    let widthPercent = 16;
    if (newAnnotMargin === 'left') {
      xPercent = 2;
      widthPercent = 15;
    } else if (newAnnotMargin === 'top_callout') {
      xPercent = 5;
      widthPercent = 88;
    } else if (newAnnotMargin === 'score_stamp') {
      xPercent = 65;
      widthPercent = 18;
    }

    onAddAnnotation({
      pageIndex: currentPageIndex,
      xPercent,
      yPercent: newAnnotMargin === 'top_callout' ? 4 : (newAnnotMargin === 'score_stamp' ? 90 : newAnnotY),
      widthPercent,
      text: newAnnotText.trim(),
      type: newAnnotType,
      hasCheckmark: newAnnotCheckmark,
      hasCross: newAnnotCross,
      editedByUser: true,
    });
    setIsAddingNew(false);
    setNewAnnotText('');
    setNewAnnotCheckmark(false);
    setNewAnnotCross(false);
  };

  // Filter annotations for this page
  const pageAnnotations = currentPage.annotations || [];

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800">
      
      {/* Top Page Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between text-xs text-slate-300">
        
        {/* Left: Page Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-medium text-slate-200">
            Page <span className="font-bold text-red-400 font-mono">{currentPage.pageNumber}</span> of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(Math.min(totalPages - 1, currentPageIndex + 1))}
            disabled={currentPageIndex === totalPages - 1}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {currentPage.questionNumber && (
            <span className="ml-1 sm:ml-2 px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Q{currentPage.questionNumber} ({currentPage.maxMarks || 10}M)
            </span>
          )}

          {currentPage.imageBase64 ? (
            <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono text-[10px]">
              <FileImage className="w-3 h-3 text-emerald-400" />
              <span>Original Scanned Copy</span>
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700 font-mono text-[10px]">
              <Layers className="w-3 h-3" />
              <span>Specimen Answer Sheet</span>
            </span>
          )}
        </div>

        {/* Right Toolbar Controls: Toggles & Zoom */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Toggle Tick Mark (✓) */}
          <button
            onClick={() => setShowTicks(!showTicks)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
              showTicks 
                ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80' 
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-400'
            }`}
            title="Toggle red/green tick marks (✓) on annotations"
          >
            <span className="font-bold text-xs">✓</span>
            <span className="hidden sm:inline">Ticks {showTicks ? 'ON' : 'OFF'}</span>
          </button>

          {/* Toggle Cross Mark (✗) */}
          <button
            onClick={() => setShowCrosses(!showCrosses)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
              showCrosses 
                ? 'bg-red-950/70 text-red-300 border-red-800/80' 
                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-400'
            }`}
            title="Toggle red cross marks (✗) on error annotations"
          >
            <span className="font-bold text-xs">✗</span>
            <span className="hidden sm:inline">Crosses {showCrosses ? 'ON' : 'OFF'}</span>
          </button>

          {/* Toggle Margin Grid & Coordinates Validation */}
          <button
            onClick={() => setShowPlacementGrid(!showPlacementGrid)}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-medium transition-colors border ${
              showPlacementGrid 
                ? 'bg-blue-950/80 text-blue-300 border-blue-600/80 shadow-sm' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
            }`}
            title="Inspect coordinate boundaries & margin zones for comments"
          >
            <Crosshair className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Margin Grid {showPlacementGrid ? 'ON' : 'OFF'}</span>
          </button>

          {/* Add Note Button */}
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-red-900/40 text-red-300 border border-red-800/60 hover:bg-red-900/60 transition-colors font-medium"
            title="Add a custom teacher margin note on this page"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Margin Note</span>
          </button>

          {/* Direct Download Annotated PDF Button */}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow-sm transition-all border border-emerald-400/40"
              title="Download evaluated booklet PDF with native FreeText annotations"
            >
              <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded px-1.5 py-0.5 border border-slate-700">
            <button
              onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
              className="p-1 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* FreeText Editable Notice Bar */}
      <div className="bg-amber-950/40 border-b border-amber-900/40 px-3 sm:px-4 py-1.5 flex items-center justify-between text-[11px] text-amber-200">
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Instant Comment Editing:</strong> Click any margin annotation to edit text, swap checkmarks/crosses, or adjust marks immediately. Exports as native FreeText in PDF!
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {onUploadCopyImage && (
            <label className="text-[10px] text-amber-300 hover:text-amber-100 underline cursor-pointer">
              Upload Original Image for Page
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadCopyImage(file);
                }} 
              />
            </label>
          )}
          <span className="hidden sm:inline font-mono text-amber-400/80">
            {pageAnnotations.length} notes
          </span>
        </div>
      </div>

      {/* Canvas Area (Scrollable) */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 flex justify-center bg-slate-900/50">
        
        {/* A4 Answer Booklet Page */}
        <div 
          className="relative bg-white text-slate-900 shadow-2xl rounded-sm transition-transform duration-200 origin-top select-text"
          style={{
            width: `${Math.round(790 * (zoomLevel / 100))}px`,
            minHeight: `${Math.round(1115 * (zoomLevel / 100))}px`,
          }}
        >
          
          {/* ========================================================
              IF ORIGINAL SCANNED IMAGE IS PRESENT: RENDER IT AS BACKGROUND
              ======================================================== */}
          {currentPage.imageBase64 ? (
            <div className="absolute inset-0 z-0">
              <img 
                src={currentPage.imageBase64} 
                alt={`Original UPSC Copy Page ${currentPage.pageNumber}`}
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            </div>
          ) : (
            <>
              {/* UPSC Standard Header */}
              <div className="pt-6 pb-2 px-8 border-b border-slate-200 text-center relative z-0">
                <div className="font-serif font-black text-2xl tracking-widest text-slate-900 uppercase">
                  UPSC
                </div>
                <p className="text-[10px] text-slate-500 font-serif italic mt-0.5">
                  Answer Questions in NOT MORE THAN the Word Limit specified for each in the Parenthesis.
                </p>
                <p className="text-[9px] text-slate-400 uppercase tracking-tight">
                  (Specimen Answer Booklet - LevelUp Mentorship Program)
                </p>
                
                {/* Page Number Top Corner */}
                <div className="absolute top-5 right-8 text-xs font-mono font-bold text-slate-400">
                  Page {currentPage.pageNumber}
                </div>
              </div>

              {/* Left Vertical Margin Line (x ≈ 13%) */}
              <div 
                className="absolute top-20 bottom-12 border-r border-red-400/60 z-0 pointer-events-none"
                style={{ left: '13%' }}
              >
                <div className="absolute top-4 left-1.5 text-[8.5px] leading-tight font-serif text-slate-400 select-none transform -rotate-0 opacity-70 w-16">
                  Candidates must not write on this margin
                </div>
              </div>

              {/* Right Vertical Margin Line (x ≈ 82%) */}
              <div 
                className="absolute top-20 bottom-12 border-l border-red-400/60 z-0 pointer-events-none"
                style={{ left: '81.5%' }}
              >
                <div className="absolute top-4 left-2 text-[8.5px] leading-tight font-serif text-slate-400 select-none opacity-70 w-16">
                  Candidates must not write on this margin
                </div>
              </div>

              {/* Page Content Body (Ruled Lines) */}
              <div 
                className="relative px-4 py-6 z-0"
                style={{ minHeight: '980px' }}
              >
                {/* Title / Question Text */}
                {currentPage.title && (
                  <div className="ml-[14%] mr-[19%] mb-4">
                    <h3 className="font-serif font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
                      {currentPage.title}
                    </h3>
                  </div>
                )}

                {/* Ruled Lines Container */}
                <div className="ml-[14%] mr-[19%] space-y-3 font-serif">
                  {currentPage.studentLines.map((line, idx) => (
                    <div 
                      key={idx} 
                      className="relative group border-b border-blue-100/80 pb-1 min-h-[26px] flex items-baseline justify-between"
                    >
                      <p className="text-xs sm:text-[13px] leading-relaxed font-sans text-indigo-950 font-normal tracking-wide">
                        {line}
                      </p>
                    </div>
                  ))}

                  {/* Hand-drawn diagram representation */}
                  {currentPage.diagramLabel && (
                    <div className="my-6 p-4 rounded border-2 border-dashed border-slate-300 bg-slate-50/70 text-center">
                      <div className="inline-block p-2 rounded bg-white shadow-sm border border-slate-200">
                        <span className="text-[11px] font-sans font-medium text-slate-700">
                          [Diagram Illustrated by Candidate: {currentPage.diagramLabel}]
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* UPSC Specimen Footer */}
              <div className="absolute bottom-3 left-0 right-0 text-center text-[9px] text-slate-400 font-serif border-t border-slate-100 pt-1 z-0">
                Specimen Answer Booklet - LevelUp Mentorship Program • Page {currentPage.pageNumber}
              </div>
            </>
          )}

          {/* ========================================================
              MARGIN & COORDINATE VALIDATION OVERLAY
              Visualizes Left Margin (0-13%), Right Margin (82-100%),
              Top Callout Zone (0-12%), and Answer Zone (14-81%)
              ======================================================== */}
          {showPlacementGrid && (
            <div className="absolute inset-0 pointer-events-none z-10 transition-opacity">
              {/* Left Margin Zone: x 0% to 13% */}
              <div 
                className="absolute top-0 bottom-0 left-0 bg-blue-500/10 border-r-2 border-dashed border-blue-500 flex flex-col justify-between p-2"
                style={{ width: '13%' }}
              >
                <span className="text-[9px] font-mono font-bold text-blue-700 bg-white/90 px-1 py-0.5 rounded shadow-sm">
                  Left Margin (x: 1-13%)
                </span>
                <span className="text-[8px] font-mono text-blue-600 bg-white/80 p-0.5 rounded">
                  ✓ Valid zone for teacher notes
                </span>
              </div>

              {/* Student Answer Writing Zone: x 13% to 81.5% */}
              <div 
                className="absolute top-0 bottom-0 bg-amber-500/5 flex flex-col justify-start items-center p-2"
                style={{ left: '13%', width: '68.5%' }}
              >
                <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded shadow-sm mt-3">
                  Student Handwritten Answer Field (x: 14-81%) — Margin notes kept outside
                </span>
              </div>

              {/* Right Margin Zone: x 81.5% to 100% */}
              <div 
                className="absolute top-0 bottom-0 right-0 bg-emerald-500/10 border-l-2 border-dashed border-emerald-500 flex flex-col justify-between p-2"
                style={{ width: '18.5%' }}
              >
                <span className="text-[9px] font-mono font-bold text-emerald-800 bg-white/90 px-1 py-0.5 rounded shadow-sm text-right">
                  Right Margin (x: 82-99%)
                </span>
                <span className="text-[8px] font-mono text-emerald-700 bg-white/80 p-0.5 rounded text-right">
                  ✓ Primary margin for red comments
                </span>
              </div>
            </div>
          )}

          {/* ========================================================
              OVERLAY: MARGIN TEACHER ANNOTATIONS
              Works identically over both original copy image and specimen!
              ======================================================== */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {pageAnnotations.map((annot) => {
              const isSelected = selectedAnnotId === annot.id;
              
              // Color styles
              let borderColor = 'border-red-500';
              let bgColor = 'bg-red-50/95 text-red-700';

              if (annot.type === 'praise') {
                borderColor = 'border-emerald-500';
                bgColor = 'bg-emerald-50/95 text-emerald-800';
              } else if (annot.type === 'mark') {
                borderColor = 'border-red-600';
                bgColor = 'bg-red-100/90 text-red-800 font-bold';
              } else if (annot.type === 'demand_missed') {
                borderColor = 'border-red-600';
                bgColor = 'bg-red-50 text-red-800';
              }

              return (
                <div
                  key={annot.id}
                  className={`absolute pointer-events-auto group transition-all duration-150 rounded shadow-md border ${borderColor} ${bgColor} ${
                    isSelected ? 'ring-2 ring-red-400 shadow-xl z-30' : 'hover:shadow-lg'
                  }`}
                  style={{
                    left: `${annot.xPercent}%`,
                    top: `${annot.yPercent}%`,
                    width: `${annot.widthPercent || 16}%`,
                    maxWidth: annot.widthPercent && annot.widthPercent > 50 ? '90%' : '300px',
                  }}
                  onClick={() => startEdit(annot)}
                >
                  {/* Annotation Header / Controls */}
                  <div className="px-2 py-0.5 flex items-center justify-between border-b border-red-200/50 bg-red-100/30">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-mono font-bold opacity-80">
                        {annot.type === 'mark' ? 'Score' : 'Comment'}
                      </span>
                      {/* Margin position badge */}
                      <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-red-200/60 text-red-900 font-semibold" title={`Coordinates: x=${annot.xPercent}%, y=${annot.yPercent}%`}>
                        {annot.xPercent <= 15 ? 'Left Margin' : annot.xPercent >= 75 ? 'Right Margin' : 'Body Zone'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(annot);
                        }}
                        className="p-0.5 hover:text-red-900 rounded"
                        title="Edit text & placement"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAnnotation(annot.id);
                        }}
                        className="p-0.5 hover:text-red-900 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="p-2 text-[10.5px] leading-tight font-sans font-medium whitespace-pre-line relative">
                    {/* Render Tick Mark (if enabled globally and on note) */}
                    {showTicks && annot.hasCheckmark && (
                      <span className="font-bold text-red-600 mr-1 text-sm inline-block">✓</span>
                    )}
                    {/* Render Cross Mark (if enabled globally and on note) */}
                    {showCrosses && annot.hasCross && (
                      <span className="font-bold text-red-600 mr-1 text-sm inline-block">✗</span>
                    )}
                    {annot.text}
                  </div>

                  {/* Inline Instant Editor if selected */}
                  {isSelected && (
                    <div 
                      className="p-2.5 border-t border-red-200 bg-white rounded-b space-y-2 shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1">
                          Edit Comment Text:
                        </label>
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full text-xs p-1.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500 font-sans text-slate-800"
                          rows={3}
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={editingType}
                          onChange={(e) => setEditingType(e.target.value as any)}
                          className="text-[10px] p-1 border rounded bg-slate-50 text-slate-700"
                        >
                          <option value="suggestion">Suggestion</option>
                          <option value="correction">Correction</option>
                          <option value="praise">Praise</option>
                          <option value="demand_missed">Demand Missed</option>
                          <option value="mark">Mark / Score</option>
                        </select>

                        {/* Checkmark & Cross toggles for this individual note */}
                        <div className="flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCheckmark(!editingCheckmark);
                              if (!editingCheckmark) setEditingCross(false);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              editingCheckmark 
                                ? 'bg-emerald-600 text-white border-emerald-700' 
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                            title="Toggle Tick Mark on this note"
                          >
                            ✓ Tick
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCross(!editingCross);
                              if (!editingCross) setEditingCheckmark(false);
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                              editingCross 
                                ? 'bg-red-600 text-white border-red-700' 
                                : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                            title="Toggle Cross Mark on this note"
                          >
                            ✗ Cross
                          </button>
                        </div>
                      </div>

                      {/* Precise Coordinate Tuning & Zone Presets */}
                      <div className="p-1.5 rounded bg-slate-50 border border-slate-200 text-[10px] space-y-1.5">
                        <div className="flex items-center justify-between font-mono text-slate-600 font-semibold">
                          <span>Placement Coordinates:</span>
                          <span className="text-indigo-700">X: {editingX}% • Y: {editingY}%</span>
                        </div>

                        {/* Quick Margin Snap Presets */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => { setEditingX(2); setEditingWidth(15); }}
                            className={`px-1.5 py-0.5 rounded text-[9.5px] border ${
                              editingX <= 15 ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            Snap Left (2%)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingX(82); setEditingWidth(16); }}
                            className={`px-1.5 py-0.5 rounded text-[9.5px] border ${
                              editingX >= 80 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            Snap Right (82%)
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingX(14); setEditingWidth(68); }}
                            className={`px-1.5 py-0.5 rounded text-[9.5px] border ${
                              editingX > 15 && editingX < 80 ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                            }`}
                          >
                            Callout Banner
                          </button>
                        </div>

                        {/* Vertical Y-Position Slider */}
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-500 font-mono text-[9px]">Vertical Y:</span>
                          <input
                            type="range"
                            min="2"
                            max="92"
                            value={editingY}
                            onChange={(e) => setEditingY(Number(e.target.value))}
                            className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                          />
                          <span className="font-mono text-[9px] text-slate-600 w-7 text-right">{editingY}%</span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-1.5 pt-1">
                        <button
                          onClick={() => saveEdit(annot)}
                          className="px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-semibold hover:bg-red-700 shadow-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setSelectedAnnotId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px] hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* Modal for Adding New Margin Note */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-5 text-white shadow-2xl">
            <h3 className="font-serif font-bold text-base text-red-400 mb-2 flex items-center">
              <Pencil className="w-4 h-4 mr-2" />
              Add Custom Teacher Margin Note
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Write an authentic teacher comment to place on Page {currentPage.pageNumber}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Comment Text:
                </label>
                <textarea
                  value={newAnnotText}
                  onChange={(e) => setNewAnnotText(e.target.value)}
                  placeholder="e.g. Add 'narrow bands' keyword. Mention 9-16 km height."
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500 font-sans"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Placement:
                  </label>
                  <select
                    value={newAnnotMargin}
                    onChange={(e) => setNewAnnotMargin(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="right">Right Margin (Standard)</option>
                    <option value="left">Left Margin</option>
                    <option value="top_callout">Top Banner (Demand Missed)</option>
                    <option value="score_stamp">Bottom Right (Score Stamp)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Comment Type:
                  </label>
                  <select
                    value={newAnnotType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewAnnotType(val);
                      if (val === 'praise') setNewAnnotCheckmark(true);
                      if (val === 'correction') setNewAnnotCross(true);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="suggestion">Suggestion / Keyword</option>
                    <option value="correction">Correction / Factual Error</option>
                    <option value="praise">Praise / Valid Point</option>
                    <option value="demand_missed">Demands Missed</option>
                    <option value="mark">Score Badge (e.g. 4/10)</option>
                  </select>
                </div>
              </div>

              {/* Toggles for Tick / Cross on new annotation */}
              <div className="flex items-center space-x-4 pt-1">
                <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnnotCheckmark}
                    onChange={(e) => {
                      setNewAnnotCheckmark(e.target.checked);
                      if (e.target.checked) setNewAnnotCross(false);
                    }}
                    className="accent-emerald-500 rounded"
                  />
                  <span>Include Tick Mark (✓)</span>
                </label>

                <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAnnotCross}
                    onChange={(e) => {
                      setNewAnnotCross(e.target.checked);
                      if (e.target.checked) setNewAnnotCheckmark(false);
                    }}
                    className="accent-red-500 rounded"
                  />
                  <span>Include Cross Mark (✗)</span>
                </label>
              </div>

              {newAnnotMargin !== 'top_callout' && newAnnotMargin !== 'score_stamp' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Vertical Position: {newAnnotY}% from top of page
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={newAnnotY}
                    onChange={(e) => setNewAnnotY(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                disabled={!newAnnotText.trim()}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white disabled:opacity-50"
              >
                Insert Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
