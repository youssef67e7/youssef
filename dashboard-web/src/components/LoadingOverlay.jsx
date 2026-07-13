export default function LoadingOverlay({ isLoading, children, message }) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 rounded-xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 flex flex-col items-center gap-3 shadow-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            {message && <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
