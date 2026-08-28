import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react'; // Icon library

export const SummaryView = ({ data }: { data: any }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    // Capture the DOM element as an image, then put it in a PDF
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Executive_Summary.pdf');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Executive Summary</h2>
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Download size={18} /> Download PDF
        </button>
      </div>

      {/* This is the area that gets printed to the PDF */}
      <div ref={printRef} className="p-8 bg-white">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">
          {data.headline}
        </h1>
        <ul className="space-y-4">
          {data.key_points.map((point: string, index: number) => (
            <li key={index} className="flex gap-3 items-start text-gray-700 leading-relaxed text-lg">
              <span className="text-blue-500 font-bold">â€¢</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
