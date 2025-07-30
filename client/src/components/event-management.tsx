import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertEventSchema, Event } from "@shared/schema";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";

const eventFormSchema = insertEventSchema.extend({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  attachmentUrl: z.string().optional(),
  notificationLink: z.string().optional(),
});

type EventForm = z.infer<typeof eventFormSchema>;
type EventWithStatus = Event & { status: string };

export function EventManagement() {
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery<EventWithStatus[]>({
    queryKey: ["/api/events"],
  });

  const form = useForm<EventForm>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      company: "",
      startDate: "",
      endDate: "",
      attachmentUrl: "",
      notificationLink: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      const eventData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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

  const updateEventMutation = useMutation({
    mutationFn: async (data: EventForm) => {
      if (!editingEvent) return;
      const eventData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };
      const response = await apiRequest("PUT", `/api/events/${editingEvent.id}`, eventData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
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

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddEvent = () => {
    setEditingEvent(null);
    form.reset({
      title: "",
      description: "",
      company: "",
      startDate: "",
      endDate: "",
      attachmentUrl: "",
      notificationLink: "",
    });
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      description: event.description,
      company: event.company,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      attachmentUrl: event.attachmentUrl || "",
      notificationLink: event.notificationLink || "",
    });
    setShowEventModal(true);
  };

  const handleDeleteEvent = (id: number) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    form.reset();
  };

  const onSubmit = (data: EventForm) => {
    if (editingEvent) {
      updateEventMutation.mutate(data);
    } else {
      createEventMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-500';
      case 'upcoming':
        return 'bg-blue-500';
      case 'past':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-slate-800">Manage Events</h3>
        <Button onClick={handleAddEvent}>
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No events created yet.</p>
              <Button className="mt-4" onClick={handleAddEvent}>
                Create your first event
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event: EventWithStatus) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">{event.company}</p>
                  </div>
                  <Badge className={`${getStatusColor(event.status)} text-white`}>
                    {event.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">{event.description}</p>
                <p className="text-xs text-slate-500 mb-2">
                  Start: {new Date(event.startDate).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  End: {new Date(event.endDate).toLocaleString()}
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditEvent(event)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showEventModal} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Add New Event"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Enter company name"
                {...form.register("company")}
              />
              {form.formState.errors.company && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.company.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter event description"
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                id="startDate"
                type="datetime-local"
                {...form.register("startDate")}
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                id="endDate"
                type="datetime-local"
                {...form.register("endDate")}
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notificationLink">Notification Link (Optional)</Label>
              <Input
                id="notificationLink"
                type="url"
                placeholder="https://example.com/notification"
                {...form.register("notificationLink")}
              />
              <p className="text-xs text-slate-500 mt-1">Add a web link for this event notification</p>
            </div>

            <div>
              <Label htmlFor="attachmentUrl">Attachment File URL (Optional)</Label>
              <Input
                id="attachmentUrl"
                type="url"
                placeholder="https://example.com/document.pdf"
                {...form.register("attachmentUrl")}
              />
              <p className="text-xs text-slate-500 mt-1">Add a PDF or document link for this event</p>
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createEventMutation.isPending || updateEventMutation.isPending}
              >
                {createEventMutation.isPending || updateEventMutation.isPending 
                  ? "Saving..." 
                  : editingEvent ? "Update" : "Create"
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
