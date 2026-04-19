import React, { RefObject } from 'react';
import { ArrowLeft, Database, Download, Upload, FileJson } from 'lucide-react';
import { ViewMode } from '../types';

interface BackupViewProps {
  setView: (view: ViewMode) => void;
  handleExportData: () => void;
  handleImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

const BackupView: React.FC<BackupViewProps> = ({ setView, handleExportData, handleImportData, fileInputRef }) => {
  return (
    <div className="p-6 max-w-md mx-auto min-h-screen">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setView('dashboard')} className="p-2 -ml-2 text-gray-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">資料管理 & 備份</h1>
      </div>

      <div className="bg-card p-6 rounded-xl border border-slate-700 mb-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-primary" /> 本機資料備份
        </h2>
        <p className="text-xs text-gray-400 mb-6 leading-relaxed">
          您的訓練資料目前儲存在此裝置的瀏覽器中。為了防止資料遺失（如清除快取或更換手機），建議您定期下載備份檔案。
        </p>

        <div className="grid gap-4">
          <button 
            onClick={handleExportData}
            className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <Download className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">匯出備份檔</div>
                <div className="text-[10px] text-gray-500">下載 .json 檔案至裝置</div>
              </div>
            </div>
          </button>

          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg text-accent">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-white">還原備份檔</div>
                  <div className="text-[10px] text-gray-500">從 .json 檔案恢復紀錄</div>
                </div>
              </div>
            </button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-900/10 border border-yellow-900/30 rounded-lg">
          <h3 className="text-xs font-bold text-yellow-500 mb-1 flex items-center gap-1">
            <FileJson className="w-3 h-3" /> 注意事項
          </h3>
          <p className="text-[10px] text-yellow-500/80">
            還原備份檔將會<span className="font-bold underline">完全覆蓋</span>您目前的現有資料。請確認備份檔案是最新的版本。
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackupView;
