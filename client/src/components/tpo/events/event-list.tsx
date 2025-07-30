import React from 'react';

interface Event {
  id: number;
  title: string;
  company: string;
  year: number;
  startDate: string;
}

interface EventListProps {
  events: Event[];
  onSelect: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({ events, onSelect }) => (
  <div className="divide-y bg-white rounded shadow">
    {events.map((event) => (
      <div
        key={event.id}
        className="p-4 hover:bg-purple-50 cursor-pointer flex justify-between items-center"
        onClick={() => onSelect(event)}
      >
        <span className="font-medium">{event.title}</span>
        <span className="text-sm text-slate-500">{event.startDate.slice(0, 10)}</span>
      </div>
    ))}
  </div>
); 