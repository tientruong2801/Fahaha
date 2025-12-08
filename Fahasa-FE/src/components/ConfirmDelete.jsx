import React from 'react';

const ConfirmDelete = ({ show, handleClose, handleConfirm, message }) => {
    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 animate-fadeIn"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border-b border-red-100 rounded-t-2xl">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                            <i className="fa-solid fa-triangle-exclamation text-red-600"></i>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-red-900">Xác nhận xóa</h3>
                            <p className="text-sm text-red-600">Hành động này không thể hoàn tác</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-red-400 hover:text-red-600 transition-colors"
                        >
                            <i className="fa-solid fa-xmark text-xl"></i>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-4">
                        <p className="text-slate-700">
                            {message || "Bạn có chắc chắn muốn xóa dữ liệu này không?"}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 px-6 py-4 bg-slate-50 rounded-b-2xl">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Xóa ngay
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfirmDelete;