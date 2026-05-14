export default function Card({ children, className = '' }) {
    return (
        <div className={`card p-4 sm:p-6 ${className}`}>
            {children}
        </div>
    );
}