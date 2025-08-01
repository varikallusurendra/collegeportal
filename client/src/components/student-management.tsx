import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertStudentSchema, Student } from "@shared/schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Users, UserCheck, Building } from "lucide-react";

const studentFormSchema = insertStudentSchema.extend({
  year: z.number().min(1, "Year is required").max(4, "Year must be between 1-4"),
  package: z.number().optional(),
});

type StudentForm = z.infer<typeof studentFormSchema>;

export function StudentManagement() {
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const form = useForm<StudentForm>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      rollNumber: "",
      branch: "",
      year: 1,
      email: "",
      phone: "",
      selected: false,
      companyName: "",
      package: undefined,
      role: "",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentForm) => {
      // Send as JSON instead of FormData
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
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
    mutationFn: async (data: StudentForm) => {
      if (!editingStudent) return;
      const response = await apiRequest("PUT", `/api/students/${editingStudent.id}`, data);
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

  const deleteStudentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/students/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
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
      year: 1,
      email: "",
      phone: "",
      selected: false,
      companyName: "",
      package: undefined,
      role: "",
    });
    setShowStudentModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    form.reset({
      name: student.name,
      rollNumber: student.rollNumber,
      branch: student.branch || "",
      year: student.year || 1,
      email: student.email || "",
      phone: student.phone || "",
      selected: student.selected || false,
      companyName: student.companyName || "",
      package: student.package || undefined,
      role: student.role || "",
    });
    setShowStudentModal(true);
  };

  const handleDeleteStudent = (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setShowStudentModal(false);
    setEditingStudent(null);
    form.reset();
  };

  const onSubmit = (data: StudentForm) => {
    // Clean the data before sending
    const cleanData = {
      ...data,
      package: data.package === "" || data.package === null || data.package === undefined ? undefined : data.package,
    };
    
    console.log("Form data being sent:", cleanData);
    console.log("Form validation errors:", form.formState.errors);
    
    // Check if required fields are present
    if (!cleanData.name || !cleanData.rollNumber) {
      console.error("Missing required fields:", { name: cleanData.name, rollNumber: cleanData.rollNumber });
      return;
    }
    
    if (editingStudent) {
      updateStudentMutation.mutate(cleanData);
    } else {
      createStudentMutation.mutate(cleanData);
    }
  };

  // Group students by branch and year
  const groupedStudents = students.reduce((acc, student) => {
    const branch = student.branch || 'Unknown';
    const year = student.year || 0;
    if (!acc[branch]) acc[branch] = {};
    if (!acc[branch][year]) acc[branch][year] = [];
    acc[branch][year].push(student);
    return acc;
  }, {} as Record<string, Record<number, Student[]>>);

  if (isLoading) {
    return <div>Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-semibold text-slate-800">Student Management</h3>
          <p className="text-slate-600">Total Students: {students.length}</p>
        </div>
        <Button onClick={handleAddStudent} className="bg-primary text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {Object.keys(groupedStudents).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No students registered yet.</p>
            <Button className="mt-4" onClick={handleAddStudent}>
              Add your first student
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedStudents).map(([branch, yearGroups]) => (
            <Card key={branch}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  {branch}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(yearGroups).map(([year, students]) => (
                  <div key={year} className="mb-6">
                    <h4 className="text-lg font-medium text-slate-700 mb-3">Year {year}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.map((student) => (
                        <Card key={student.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h5 className="font-medium text-slate-800">{student.name}</h5>
                                <p className="text-sm text-slate-600">{student.rollNumber}</p>
                                {student.email && (
                                  <p className="text-xs text-slate-500">{student.email}</p>
                                )}
                              </div>
                              {student.selected && (
                                <Badge className="bg-green-500 text-white">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Placed
                                </Badge>
                              )}
                            </div>
                            {student.selected && student.companyName && (
                              <div className="mb-2 p-2 bg-green-50 rounded text-xs">
                                <p className="font-medium text-green-800">{student.companyName}</p>
                                {student.role && <p className="text-green-600">{student.role}</p>}
                                {student.package && <p className="text-green-600">₹{student.package} LPA</p>}
                              </div>
                            )}
                            <div className="flex space-x-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showStudentModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Student name"
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
                  placeholder="Roll number"
                  {...form.register("rollNumber")}
                />
                {form.formState.errors.rollNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.rollNumber.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="branch">Branch/Department</Label>
                <Controller
                  name="branch"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Mechanical">Mechanical</SelectItem>
                        <SelectItem value="Civil">Civil</SelectItem>
                        <SelectItem value="Electrical">Electrical</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Controller
                  name="year"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.year && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.year.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  {...form.register("email")}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Phone number"
                  {...form.register("phone")}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="selected"
                  control={form.control}
                  render={({ field }) => (
                    <Checkbox
                      id="selected"
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="selected">Student is placed</Label>
              </div>

              {form.watch("selected") && (
                <div className="space-y-3 pl-6 border-l-2 border-green-200">
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="Company name"
                      {...form.register("companyName")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Job Role</Label>
                    <Input
                      id="role"
                      placeholder="Job role"
                      {...form.register("role")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="package">Package (LPA)</Label>
                    <Input
                      id="package"
                      type="number"
                      placeholder="Package in LPA"
                      {...form.register("package", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </div>

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