'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { 
  UploadCloud, 
  ArrowLeft, 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CsvImportPage() {
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
    failedCount: number;
    errors: { row: number; sku?: string; message: string }[];
    message: string;
  } | null>(null);

  const sampleCsvContent = `Title,SKU,Selling Price,Regular Price,Stock,Category,Supplier,Image URL,Description
Chanderi Cotton Silk Printed Saree,SAR-CHAN-101,1199,2499,30,womens-ethnic,Surat Textile Weavers Association,https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80,Handcrafted Chanderi lightweight festive saree
Men Slim Fit Mandarin Casual Shirt,MEN-SHIRT-102,649,1299,45,mens-fashion,Surat Textile Weavers Association,https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80,Breathable 100% cotton casual shirt with mandarin collar
Pure Cotton Double Bedsheet with 2 Pillows,BED-COT-103,499,999,60,home-kitchen,Jaipur Heritage Block Prints,https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80,210 TC soft cotton king size bedsheet with matching pillow covers`;

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shophaven_products_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setParsedRows(results.data);
      },
      error: (err) => {
        alert(`Error reading CSV: ${err.message}`);
      },
    });
  };

  const handleStartImport = async () => {
    if (parsedRows.length === 0) return;

    setLoading(true);
    setImportResult(null);

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      });

      const data = await res.json();
      setImportResult(data);
    } catch {
      setImportResult({
        success: false,
        importedCount: 0,
        failedCount: parsedRows.length,
        errors: [{ row: 0, message: 'Network error connecting to import service' }],
        message: 'Import failed due to network error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
          <h1 className="text-2xl font-extrabold text-stone-900">
            Bulk Product CSV Importer
          </h1>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
        >
          <Download className="w-4 h-4" /> Download Sample CSV
        </button>
      </div>

      {/* Upload Drop Zone Card */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-8 text-center space-y-4 hover:border-red-800/50 transition-colors">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-800 flex items-center justify-center mx-auto">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-stone-900 text-sm">
            {fileName ? `Selected: ${fileName}` : 'Upload your supplier or catalog CSV file'}
          </h3>
          <p className="text-xs text-stone-500">
            Supports columns: Title, SKU, Selling Price, Regular Price, Stock, Category, Supplier, Image URL
          </p>
        </div>

        <div>
          <label className="inline-block px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer shadow-sm">
            Choose CSV File
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Live Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-stone-900">
                Parsed Rows Preview ({parsedRows.length} items found)
              </h3>
              <p className="text-[11px] text-stone-500">
                Review columns before committing products into your database
              </p>
            </div>

            <Button
              disabled={loading}
              onClick={handleStartImport}
              className="bg-red-800 hover:bg-red-900 text-white font-bold text-xs"
            >
              {loading ? 'Importing Products...' : `Import ${parsedRows.length} Products`}
            </Button>
          </div>

          <div className="overflow-x-auto max-h-64 border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] font-bold sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Price (₹)</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {parsedRows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-stone-50">
                    <td className="py-2 px-3 font-semibold text-stone-900 max-w-xs truncate">
                      {row['Title'] || row['title']}
                    </td>
                    <td className="py-2 px-3 font-mono text-stone-600">
                      {row['SKU'] || row['sku']}
                    </td>
                    <td className="py-2 px-3 font-bold text-stone-900">
                      ₹{row['Selling Price'] || row['price']}
                    </td>
                    <td className="py-2 px-3">{row['Stock'] || row['stock']}</td>
                    <td className="py-2 px-3 text-stone-500">{row['Category'] || row['category']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 10 && (
            <p className="text-[11px] text-stone-400 italic">
              Showing first 10 rows of {parsedRows.length} total rows.
            </p>
          )}
        </div>
      )}

      {/* Import Result Notification & Rejected Rows Log */}
      {importResult && (
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            importResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-red-50 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {importResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-700" />
            )}
            <span>{importResult.message}</span>
          </div>

          <div className="flex gap-4 text-xs font-semibold">
            <span className="text-emerald-800">Successfully Imported: {importResult.importedCount}</span>
            <span className="text-red-700">Failed / Rejected: {importResult.failedCount}</span>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-red-200 space-y-1 text-xs">
              <span className="font-bold text-red-900 uppercase text-[10px] tracking-wider">
                Rejected Row Errors Log:
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
                {importResult.errors.map((err, i) => (
                  <div key={i} className="text-red-800 bg-red-100/60 p-1.5 rounded">
                    Row {err.row}: {err.sku ? `[${err.sku}] ` : ''}{err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {importResult.success && (
            <div className="pt-2">
              <Link
                href="/admin/products"
                className="inline-block px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold"
              >
                View Updated Products Catalog
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
