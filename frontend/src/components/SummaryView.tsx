import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export const SummaryView = ({ data }: { data: any }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Executive_Summary.pdf');
  };

  return (
    <div className="rounded-xl overflow-hidden">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Executive Summary</h2>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md shadow-indigo-500/20"
        >
          <Download size={16} /> Download PDF
        </button>
      </div>

      {/* PDF-printable area (always white for clean PDF output) */}
      <div ref={printRef} className="p-6 bg-white">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-5 border-b border-gray-200 pb-4">
          {data.headline}
        </h1>
        <ul className="space-y-3">
          {data.key_points?.map((point: string, index: number) => (
            <li key={index} className="flex gap-3 items-start text-gray-700 leading-relaxed">
              <span className="text-indigo-500 font-bold mt-0.5">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
