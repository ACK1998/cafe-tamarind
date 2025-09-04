import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const DateTimePicker = ({ 
  selectedDateTime, 
  onChange, 
  error, 
  disabled = false,
  placeholder = "Select date and time"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate min and max dates
  const now = new Date();
  const minDate = new Date(now.getTime() + 15 * 60000); // 15 minutes from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 3); // 3 days from now

  // Filter times to only allow future times
  const filterTime = (time) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);
    
    // If it's today, only allow times in the future
    if (selectedDate.toDateString() === currentDate.toDateString()) {
      return selectedDate > currentDate;
    }
    
    // For future dates, allow all times
    return true;
  };

  // Custom time intervals (every 15 minutes)
  const timeIntervals = 15;

  // Custom input component
  const CustomInput = React.forwardRef(({ value, onClick, onChange, placeholder, disabled }, ref) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        onClick={onClick}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="input-with-both-icons w-full cursor-pointer"
        readOnly
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <Clock className="h-5 w-5 text-gray-400" />
      </div>
    </div>
  ));

  return (
    <div className="space-y-2">
      <DatePicker
        selected={selectedDateTime}
        onChange={onChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={timeIntervals}
        dateFormat="MMMM d, yyyy h:mm aa"
        minDate={minDate}
        maxDate={maxDate}
        filterTime={filterTime}
        placeholderText={placeholder}
        disabled={disabled}
        customInput={<CustomInput />}
        open={isOpen}
        onInputClick={() => setIsOpen(true)}
        onClickOutside={() => setIsOpen(false)}
        popperClassName="z-50"
        popperPlacement="bottom-start"
        popperModifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ]}
      />
      
      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>• Pre-orders can be scheduled up to 3 days in advance</p>
        <p>• Available pickup hours: 8:00 AM - 10:00 PM</p>
        <p>• Orders are prepared 15 minutes before pickup time</p>
      </div>
    </div>
  );
};

export default DateTimePicker;
