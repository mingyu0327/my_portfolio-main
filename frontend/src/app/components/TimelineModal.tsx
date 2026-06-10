import { X, Upload, FileText, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface TimelineModalProps {
  item: {
    icon: LucideIcon;
    title: string;
    organization: string;
    date: string;
    description: string;
  } | null;
  onClose: () => void;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
}

export function TimelineModal({ item, onClose }: TimelineModalProps) {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: '수상증명서.pdf', type: 'PDF', uploadDate: '2026.01.15' },
    { id: '2', name: '활동증명서.pdf', type: 'PDF', uploadDate: '2026.01.10' },
  ]);

  if (!item) return null;

  const Icon = item.icon;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        uploadDate: new Date().toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }).replace(/\. /g, '.').replace(/\.$/, ''),
      };
      setDocuments([...documents, newDoc]);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/95 backdrop-blur-xl rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-blue-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 rounded-xl">
                <Icon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{item.title}</h2>
                <p className="text-blue-600 font-semibold">{item.organization}</p>
                <p className="text-gray-500 text-sm">{item.date}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">상세 정보</h3>
            <p className="text-gray-700 leading-relaxed">{item.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">관련 서류</h3>
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">파일 업로드</span>
                </div>
              </label>
            </div>

            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>등록된 서류가 없습니다</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type} • {doc.uploadDate}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
