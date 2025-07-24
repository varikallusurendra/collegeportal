import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertStudentSchema, Student } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, User, FileText, Building2 } from "lucide-react";

type StudentForm = z.infer<typeof insertStudentSchema>;

export function StudentManagement() {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const form = useForm<StudentForm>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      branch: "",
      email: "",
      phone: "",
      selected: false,
      companyName: "",
      photoUrl: "",
      offerLetterUrl: "",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/students", {
        method: "POST",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to create student");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!editingStudent) return;
      
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: "PUT",
        body: data,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to update student");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddStudent = () => {
    setEditingStudent(null);
    form.reset({
      name: "",
      rollNumber: "",
      branch: "",
      email: "",
      phone: "",
      selected: false,
      companyName: "",
      photoUrl: "",
      offerLetterUrl: "",
    });
    setShowStudentModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    form.reset({
      name: student.name,
      rollNumber: student.rollNumber,
      branch: student.branch || "",
      email: student.email || "",
      phone: student.phone || "",
      selected: student.selected || false,
      companyName: student.companyName || "",
      photoUrl: student.photoUrl || "",
      offerLetterUrl: student.offerLetterUrl || "",
    });
    setShowStudentModal(true);
  };

  const handleCloseModal = () => {
    setShowStudentModal(false);
    setEditingStudent(null);
    form.reset();
  };

  const onSubmit = (data: StudentForm) => {
    const formData = new FormData();
    
    // Add form fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Add files if present
    const photoInput = document.getElementById('photo') as HTMLInputElement;
    const offerLetterInput = document.getElementById('offerLetter') as HTMLInputElement;
    
    if (photoInput?.files?.[0]) {
      formData.append('photo', photoInput.files[0]);
    }
    
    if (offerLetterInput?.files?.[0]) {
      formData.append('offerLetter', offerLetterInput.files[0]);
    }

    if (editingStudent) {
      updateStudentMutation.mutate(formData);
    } else {
      createStudentMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <div>Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-slate-800">Student Management</h3>
        <Button onClick={handleAddStudent}>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <User className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No students added yet.</p>
              <Button className="mt-4" onClick={handleAddStudent}>
                Add your first student
              </Button>
            </CardContent>
          </Card>
        ) : (
          students.map((student) => (
            <Card key={student.id}>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={student.photoUrl || undefined} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-slate-600">{student.rollNumber}</p>
                    <p className="text-xs text-slate-500">{student.branch}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {student.email && (
                    <p className="text-sm text-slate-600">{student.email}</p>
                  )}
                  {student.phone && (
                    <p className="text-sm text-slate-600">{student.phone}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-slate-600">Status:</span>
                  <Badge className={student.selected ? "bg-green-500" : "bg-slate-400"}>
                    {student.selected ? "Selected" : "Not Selected"}
                  </Badge>
                </div>
                
                {student.selected && student.companyName && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">{student.companyName}</span>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditStudent(student)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {student.offerLetterUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(student.offerLetterUrl!, '_blank')}
                    >
                      <FileText className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showStudentModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter student name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  placeholder="Enter roll number"
                  {...form.register("rollNumber")}
                />
                {form.formState.errors.rollNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.rollNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  placeholder="e.g., Computer Science"
                  {...form.register("branch")}
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  {...form.register("email")}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+91 9876543210"
                {...form.register("phone")}
              />
            </div>

            <div>
              <Label htmlFor="photo">Student Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="selected"
                {...form.register("selected")}
              />
              <Label htmlFor="selected">Selected for placement</Label>
            </div>

            {form.watch("selected") && (
              <>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    {...form.register("companyName")}
                  />
                </div>

                <div>
                  <Label htmlFor="offerLetter">Offer Letter</Label>
                  <Input
                    id="offerLetter"
                    type="file"
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createStudentMutation.isPending || updateStudentMutation.isPending}
              >
                {createStudentMutation.isPending || updateStudentMutation.isPending 
                  ? "Saving..." 
                  : editingStudent ? "Update" : "Create"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
