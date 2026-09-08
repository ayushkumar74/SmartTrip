import React, { useState, useRef, useEffect, forwardRef, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const Autocomplete = forwardRef(({ label, error, value, onChange, placeholder, className = '', fetchOptions, icon: Icon = MapPin, variant = 'default', ...props }, ref) => {
 const [isOpen, setIsOpen] = useState(false);
 const [inputValue, setInputValue] = useState(value || '');
 const [activeIndex, setActiveIndex] = useState(-1);
 const [options, setOptions] = useState([]);
 const [loading, setLoading] = useState(false);
 const [selectedOption, setSelectedOption] = useState(null);
 const containerRef = useRef(null);
 const listRef = useRef(null);

 useEffect(() => {
 setInputValue(value || '');
 }, [value]);

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (containerRef.current && !containerRef.current.contains(event.target)) {
 setIsOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 // Fetch options asynchronously
 useEffect(() => {
 let active = true;

 const loadOptions = async () => {
 if (!inputValue || inputValue.length < 2 || !fetchOptions) {
 setOptions([]);
 return;
 }

 setLoading(true);
 try {
 const results = await fetchOptions(inputValue);
 if (active) {
 setOptions(results);
 setActiveIndex(-1);
 }
 } catch (err) {
 console.error('Failed to fetch options', err);
 } finally {
 if (active) setLoading(false);
 }
 };

 // Debounce
 const timer = setTimeout(() => {
 // Only fetch if we are actually typing a new search (not just setting value from a selection)
 if (isOpen) {
 loadOptions();
 }
 }, 300);

 return () => {
 active = false;
 clearTimeout(timer);
 };
 }, [inputValue, fetchOptions, isOpen]);

 const handleInputChange = (e) => {
 const val = e.target.value;
 setInputValue(val);
 setIsOpen(true);
 setSelectedOption(null); // Clear selected option if user types
 if (onChange) {
 onChange(e); // Trigger onChange to keep parent state in sync
 }
 };

 const handleSelectOption = (option) => {
 const display = option.displayTitle || option.title;
 setInputValue(display);
 setSelectedOption(option);
 setIsOpen(false);
 setActiveIndex(-1);
 if (onChange) {
 onChange({ target: { value: display } });
 }
 if (props.onSelectOption) {
 props.onSelectOption(option);
 }
 };

 const handleBlur = () => {
 // If not selected and we blur, we might want to clear or reset to the selected option
 // But since the parent state expects a valid value, we could let the parent handle validation.
 // For now, if no valid option is selected and there's text, we can either clear it or leave it.
 // The requirement says: "Do not allow an invalid arbitrary value to silently behave like a valid airport."
 // We can reset inputValue if it doesn't match selectedOption.
 setTimeout(() => {
 if (!selectedOption && inputValue) {
 setInputValue('');
 if (onChange) {
 onChange({ target: { value: '' } });
 }
 }
 }, 200);
 };

 const handleKeyDown = (e) => {
 if (!isOpen) {
 if (e.key === 'ArrowDown' || e.key === 'Enter') {
 setIsOpen(true);
 e.preventDefault();
 }
 return;
 }

 if (e.key === 'ArrowDown') {
 e.preventDefault();
 setActiveIndex(prev => (prev < options.length - 1 ? prev + 1 : prev));
 } else if (e.key === 'ArrowUp') {
 e.preventDefault();
 setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
 } else if (e.key === 'Enter') {
 e.preventDefault();
 if (activeIndex >= 0 && activeIndex < options.length) {
 handleSelectOption(options[activeIndex]);
 } else if (options.length > 0 && activeIndex === -1) {
 // If they just hit enter, maybe select first matching option
 handleSelectOption(options[0]);
 }
 } else if (e.key === 'Escape') {
 setIsOpen(false);
 setActiveIndex(-1);
 }
 };

 useEffect(() => {
 if (isOpen && activeIndex >= 0 && listRef.current) {
 const activeElement = listRef.current.children[activeIndex];
 if (activeElement) {
 activeElement.scrollIntoView({ block: 'nearest' });
 }
 }
 }, [activeIndex, isOpen]);

 return (
 <div className="w-full relative" ref={containerRef}>
 {label && variant === 'default' && (
 <label className="block text-sm font-medium text-text-primary mb-1">
 {label}
 </label>
 )}
 <div className="relative">
 {variant === 'travel' && label && (
 <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1 px-1">
 {label}
 </label>
 )}
 <input
 ref={ref}
 type="text"
 className={
 variant === 'travel' 
 ? `appearance-none block w-full px-1 py-1 bg-transparent text-text-primary font-bold text-base md:text-lg placeholder:text-text-muted focus:outline-none transition-colors truncate ${className}`
 : `appearance-none block w-full px-3 py-2 border rounded-md shadow-sm transition-colors sm:text-sm
 bg-surface-input text-text-primary border-border placeholder:text-text-muted 
 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
 disabled:bg-page disabled:text-text-muted disabled:border-border disabled:cursor-not-allowed
 ${error ? 'border-danger text-danger focus:ring-danger focus:border-danger ' : ''} 
 ${className}`
 }
 value={inputValue}
 onChange={handleInputChange}
 onKeyDown={handleKeyDown}
 onFocus={() => setIsOpen(true)}
 onBlur={handleBlur}
 placeholder={placeholder}
 {...props}
 />
 {variant === 'travel' && selectedOption && !isOpen && (
 <div className="absolute left-1 -bottom-4 text-xs font-semibold text-text-muted truncate max-w-full pointer-events-none">
 {selectedOption.subtitle}
 </div>
 )}
 
 {(isOpen && (options.length > 0 || loading)) && (
 <div className="absolute z-[100] w-full mt-2 bg-surface-elevated border border-border rounded-xl shadow-2xl max-h-80 overflow-y-auto">
 {loading ? (
 <div className="px-4 py-8 flex justify-center items-center text-text-muted">
 <Loader2 className="w-5 h-5 animate-spin mr-2" />
 <span className="text-sm">Searching...</span>
 </div>
 ) : (
 <ul className="py-2" ref={listRef}>
 {options.map((option, index) => (
 <li
 key={index}
 onMouseDown={(e) => {
 e.preventDefault();
 handleSelectOption(option);
 }}
 onMouseEnter={() => setActiveIndex(index)}
 className={`px-4 py-3 cursor-pointer flex items-center justify-between group transition-colors ${
 activeIndex === index 
 ? 'bg-page ' 
 : 'hover:bg-page'
 }`}
 >
 <div className="flex items-start gap-3 w-full">
 <Icon className={`h-5 w-5 mt-1 transition-colors shrink-0 ${activeIndex === index ? 'text-primary' : 'text-text-muted group-hover:text-primary'}`} />
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-center mb-0.5">
 <span className="font-bold text-text-primary truncate pr-2">{option.title}</span>
 {option.code && (
 <span className="text-xs font-bold text-text-secondary bg-page px-2 py-1 rounded-md shrink-0">
 {option.code}
 </span>
 )}
 </div>
 <div className="text-sm text-text-muted truncate">
 {option.subtitle}
 </div>
 </div>
 </div>
 </li>
 ))}
 </ul>
 )}
 </div>
 )}
 </div>
 {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
 </div>
 );
});

Autocomplete.displayName = 'Autocomplete';
export default Autocomplete;
