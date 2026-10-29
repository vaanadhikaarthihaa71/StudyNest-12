import React, { useState } from 'react';
import {
  Download,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  FileCode,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useStudy } from '../../context/StudyContext';
import { Question } from '../../types';

export const BulkImportExport: React.FC = () => {
  const { questions, chapters, subjects, importQuestions, showToast } = useStudy();

  const [rawText, setRawText] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedPreview, setParsedPreview] = useState<Question[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate Sample JSON template
  const sampleJson = [
    {
      id: 'q-custom-1',
      chapter_id: chapters[0]?.id || 'chap-phy-1',
      question_text: "State Snell's Law of refraction and define refractive index.",
      question_type: 'Short Answer',
      marks: 2,
      answer_content:
        '### Snell\'s Law:\nThe ratio of the sine of the angle of incidence to the sine of the angle of refraction is a constant for a given pair of media:\n$$\\frac{\\sin i}{\\sin r} = \\mu = n_{21}$$',
      audio_url: '',
      audio_title: '',
      video_url: '',
      video_title: '',
      status: 'published',
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Generate Sample CSV template
  const sampleCsv = `id,chapter_id,question_text,question_type,marks,answer_content,status,display_order
q-csv-1,${chapters[0]?.id || 'chap-phy-1'},"What is total internal reflection?","Short Answer",2,"Condition: Angle of incidence exceeds critical angle in denser medium.","published",1
q-csv-2,${chapters[0]?.id || 'chap-phy-1'},"Derive mirror formula for concave mirror.","Long Answer",5,"Step 1: Draw ray diagram...","published",2`;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `studynest12_questions_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported all questions to JSON file', 'success');
  };

  const handleExportCsv = () => {
    const headers = [
      'id',
      'chapter_id',
      'question_text',
      'question_type',
      'marks',
      'answer_content',
      'audio_url',
      'audio_file_name',
      'audio_file_size',
      'video_url',
      'video_file_name',
      'video_file_size',
      'status',
      'display_order',
    ];

    const rows = questions.map((q) => [
      `"${q.id}"`,
      `"${q.chapter_id}"`,
      `"${(q.question_text || '').replace(/"/g, '""')}"`,
      `"${q.question_type}"`,
      q.marks || 0,
      `"${(q.answer_content || '').replace(/"/g, '""')}"`,
      `"${q.audio_url || ''}"`,
      `"${q.audio_file_name || ''}"`,
      q.audio_file_size || 0,
      `"${q.video_url || ''}"`,
      `"${q.video_file_name || ''}"`,
      q.video_file_size || 0,
      `"${q.status}"`,
      q.display_order || 1,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `studynest12_questions_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported all questions to CSV file', 'success');
  };

  const parseAndValidate = () => {
    setValidationErrors([]);
    setParsedPreview(null);
    if (!rawText.trim()) {
      setValidationErrors(['Input data is empty. Please paste valid JSON or CSV content.']);
      return;
    }

    const errors: string[] = [];
    const validChapters = new Set(chapters.map((c) => c.id));

    if (format === 'json') {
      try {
        const parsed = JSON.parse(rawText);
        if (!Array.isArray(parsed)) {
          setValidationErrors(['JSON must be an array of question objects [ {...}, {...} ]']);
          return;
        }

        const validQuestions: Question[] = [];
        parsed.forEach((item, idx) => {
          if (!item.question_text) {
            errors.push(`Row ${idx + 1}: Missing question_text`);
          }
          if (!item.chapter_id) {
            errors.push(`Row ${idx + 1}: Missing chapter_id`);
          } else if (!validChapters.has(item.chapter_id)) {
            errors.push(`Row ${idx + 1}: chapter_id "${item.chapter_id}" not found in current syllabus.`);
          }

          const q: Question = {
            id: item.id || 'q-' + Math.random().toString(36).substring(2, 9),
            chapter_id: item.chapter_id || chapters[0]?.id || 'chap-phy-1',
            question_text: item.question_text || 'Untitled Question',
            question_type: item.question_type === 'Long Answer' ? 'Long Answer' : 'Short Answer',
            marks: item.marks ? Number(item.marks) : undefined,
            answer_content: item.answer_content || '',
            audio_url: item.audio_url || undefined,
            audio_title: item.audio_title || undefined,
            audio_description: item.audio_description || undefined,
            audio_file_name: item.audio_file_name || undefined,
            audio_file_size: item.audio_file_size ? Number(item.audio_file_size) : undefined,
            audio_storage_path: item.audio_storage_path || undefined,
            video_url: item.video_url || undefined,
            video_title: item.video_title || undefined,
            video_description: item.video_description || undefined,
            video_file_name: item.video_file_name || undefined,
            video_file_size: item.video_file_size ? Number(item.video_file_size) : undefined,
            video_storage_path: item.video_storage_path || undefined,
            status: item.status === 'draft' ? 'draft' : 'published',
            display_order: item.display_order ? Number(item.display_order) : idx + 1,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          validQuestions.push(q);
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        }
        setParsedPreview(validQuestions);
      } catch (err: any) {
        setValidationErrors([`Invalid JSON syntax: ${err.message}`]);
      }
    } else {
      // CSV parsing
      try {
        const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setValidationErrors(['CSV must have at least one header line and one data line.']);
          return;
        }

        // Simple CSV splitter respecting quotes
        const parseCsvLine = (text: string) => {
          const result: string[] = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"' && text[i + 1] === '"') {
              cur += '"';
              i++;
            } else if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(cur);
              cur = '';
            } else {
              cur += char;
            }
          }
          result.push(cur);
          return result;
        };

        const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
        const validQuestions: Question[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCsvLine(lines[i]);
          const rowObj: any = {};
          headers.forEach((h, hIdx) => {
            rowObj[h] = cols[hIdx] ? cols[hIdx].trim() : '';
          });

          if (!rowObj.question_text) {
            errors.push(`Line ${i + 1}: Missing question_text`);
          }

          const q: Question = {
            id: rowObj.id || 'q-' + Math.random().toString(36).substring(2, 9),
            chapter_id: rowObj.chapter_id || chapters[0]?.id || 'chap-phy-1',
            question_text: rowObj.question_text || 'Untitled Question',
            question_type: rowObj.question_type === 'Long Answer' ? 'Long Answer' : 'Short Answer',
            marks: rowObj.marks ? Number(rowObj.marks) : undefined,
            answer_content: rowObj.answer_content || '',
            audio_url: rowObj.audio_url || undefined,
            audio_file_name: rowObj.audio_file_name || undefined,
            audio_file_size: rowObj.audio_file_size ? Number(rowObj.audio_file_size) : undefined,
            video_url: rowObj.video_url || undefined,
            video_file_name: rowObj.video_file_name || undefined,
            video_file_size: rowObj.video_file_size ? Number(rowObj.video_file_size) : undefined,
            status: rowObj.status === 'draft' ? 'draft' : 'published',
            display_order: rowObj.display_order ? Number(rowObj.display_order) : i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          validQuestions.push(q);
        }

        if (errors.length > 0) {
          setValidationErrors(errors);
        }
        setParsedPreview(validQuestions);
      } catch (err: any) {
        setValidationErrors([`Failed to parse CSV: ${err.message}`]);
      }
    }
  };

  const handleApplyImport = () => {
    if (!parsedPreview || parsedPreview.length === 0) return;
    importQuestions(parsedPreview, importMode);
    setParsedPreview(null);
    setRawText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Bulk Content Entry & Data Management</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Import hundreds of questions via CSV or JSON, validate before saving, or export your entire question bank.
        </p>
      </div>

      {/* Export Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Download className="w-4 h-4 text-violet-600" />
          <span>Export Current Question Bank ({questions.length} questions)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Save a complete backup of all questions, model answers, and media metadata to your local computer.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span>Export as JSON</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export as CSV</span>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-violet-600" />
            <span>Bulk Import Questions</span>
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Format:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  format === 'json' ? 'bg-white text-violet-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                JSON
              </button>
              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  format === 'csv' ? 'bg-white text-violet-700 shadow-2xs' : 'text-slate-500'
                }`}
              >
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Quick template loader button */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Need a starting template?</span>
          <button
            type="button"
            onClick={() =>
              setRawText(format === 'json' ? JSON.stringify(sampleJson, null, 2) : sampleCsv)
            }
            className="text-violet-700 font-bold hover:underline cursor-pointer"
          >
            Load Sample {format.toUpperCase()}
          </button>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={
            format === 'json'
              ? 'Paste JSON array of questions here...'
              : 'Paste CSV rows here (with header)...'
          }
          rows={8}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-hidden focus:border-violet-600"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Import Mode:</label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'append'}
                onChange={() => setImportMode('append')}
                className="accent-violet-600"
              />
              <span>Append (merge by ID)</span>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="radio"
                name="importMode"
                checked={importMode === 'replace'}
                onChange={() => setImportMode('replace')}
                className="accent-violet-600"
              />
              <span>Replace entire question bank</span>
            </label>
          </div>

          <button
            type="button"
            onClick={parseAndValidate}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Validate & Preview Import
          </button>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Validation Issues Detected ({validationErrors.length})</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pt-1">
              {validationErrors.slice(0, 5).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {validationErrors.length > 5 && (
                <li>...and {validationErrors.length - 5} more issues.</li>
              )}
            </ul>
          </div>
        )}

        {/* Preview Table */}
        {parsedPreview && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle className="w-4 h-4" />
                <span>Ready to Import: {parsedPreview.length} questions validated</span>
              </div>
              <button
                type="button"
                onClick={handleApplyImport}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Confirm & Import {parsedPreview.length} Questions
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-2.5">ID</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Question Text</th>
                    <th className="p-2.5">Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedPreview.slice(0, 10).map((q) => (
                    <tr key={q.id}>
                      <td className="p-2.5 font-mono text-slate-400">{q.id}</td>
                      <td className="p-2.5 font-semibold text-slate-700">{q.question_type}</td>
                      <td className="p-2.5 font-medium text-slate-900 truncate max-w-xs">
                        {q.question_text}
                      </td>
                      <td className="p-2.5 text-slate-500">{q.marks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedPreview.length > 10 && (
                <div className="p-2 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                  + {parsedPreview.length - 10} more questions previewed.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
