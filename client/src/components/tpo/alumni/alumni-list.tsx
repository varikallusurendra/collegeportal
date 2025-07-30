import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Phone, Mail, MapPin } from 'lucide-react';

interface Alumni {
  id: number;
  name: string;
  rollNumber: string;
  passOutYear: number;
  higherEducationCollege?: string;
  contactNumber: string;
  email: string;
  address: string;
}

interface AlumniListProps {
  alumni: Alumni[];
  onSelect: (alumni: Alumni) => void;
}

export function AlumniList({ alumni, onSelect }: AlumniListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {alumni.map((alumnus) => (
        <Card 
          key={alumnus.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelect(alumnus)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{alumnus.name}</h3>
                <p className="text-sm text-slate-600">{alumnus.rollNumber}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {alumnus.higherEducationCollege && (
                <div className="flex items-center text-blue-600">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  <span className="truncate">{alumnus.higherEducationCollege}</span>
                </div>
              )}
              <div className="flex items-center text-slate-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{alumnus.contactNumber}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <Mail className="w-4 h-4 mr-2" />
                <span className="truncate">{alumnus.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}