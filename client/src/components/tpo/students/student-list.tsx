import React from 'react';

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  branch: string;
  year: number;
}

interface StudentListProps {
  students: Student[];
  onSelect: (student: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({ students, onSelect }) => (
  <div className="divide-y bg-white rounded shadow">
    {students.map((student) => (
      <div
        key={student.id}
        className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center"
        onClick={() => onSelect(student)}
      >
        <span className="font-medium">{student.name}</span>
        <span className="text-sm text-slate-500">{student.rollNumber}</span>
      </div>
    ))}
  </div>
); 