'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Mail, 
  TrendingUp, 
  MessageSquare, 
  Award, 
  Edit, 
  Trash2,
  Send,
  Eye,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import useStore from '@/lib/store';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastData, setBroadcastData] = useState({ subject: '', message: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!user.isAdmin) {
      toast.error('Admin access required');
      router.push('/');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsRes = await fetch(`/api/admin/stats?adminId=${user.id}`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch users
      const usersRes = await fetch(`/api/admin/users?adminId=${user.id}`);
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastData.subject || !broadcastData.message) {
      toast.error('Subject and message are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          subject: broadcastData.subject,
          message: broadcastData.message
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        setBroadcastOpen(false);
        setBroadcastData({ subject: '', message: '' });
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error broadcasting email:', error);
      toast.error('Failed to send broadcast email');
    }
  };

  const handleEditUser = async () => {
    try {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          targetUserId: selectedUser.id,
          updates: editData
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User updated successfully');
        setEditOpen(false);
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: user.id,
          targetUserId: userId
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        fetchData();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      Bronze: 'bg-orange-700',
      Silver: 'bg-gray-400',
      Gold: 'bg-yellow-500',
      Platinum: 'bg-cyan-500',
      Diamond: 'bg-blue-600',
    };
    return colors[role] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Manage users and broadcast messages</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Episodes Watched
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalEpisodesWatched}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Total Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalComments}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4" />
                Role Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                {stats.roleDistribution.map(role => (
                  <div key={role._id} className="flex justify-between">
                    <span>{role._id || 'Unknown'}:</span>
                    <span className="font-bold">{role.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Broadcast Email */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Broadcast Email
          </CardTitle>
          <CardDescription>
            Send email to all verified users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Compose Broadcast
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Broadcast Email</DialogTitle>
                <DialogDescription>
                  This will send an email to all users with verified emails
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Email subject"
                    value={broadcastData.subject}
                    onChange={(e) => setBroadcastData({ ...broadcastData, subject: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message (HTML supported)</Label>
                  <Textarea
                    id="message"
                    placeholder="Email message..."
                    rows={8}
                    value={broadcastData.message}
                    onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBroadcastOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBroadcast}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Broadcast
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>XP</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.level}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(u.role)}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.xp}</TableCell>
                    <TableCell>
                      {u.emailVerified ? '✅' : '❌'}
                    </TableCell>
                    <TableCell>
                      {u.isAdmin ? '👑' : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog open={editOpen && selectedUser?.id === u.id} onOpenChange={(open) => {
                          setEditOpen(open);
                          if (open) {
                            setSelectedUser(u);
                            setEditData({
                              name: u.name,
                              xp: u.xp,
                              level: u.level,
                              isAdmin: u.isAdmin
                            });
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Name</Label>
                                <Input
                                  value={editData.name || ''}
                                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                              </div>
                              <div>
                                <Label>XP</Label>
                                <Input
                                  type="number"
                                  value={editData.xp || 0}
                                  onChange={(e) => setEditData({ ...editData, xp: parseInt(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label>Level</Label>
                                <Input
                                  type="number"
                                  value={editData.level || 1}
                                  onChange={(e) => setEditData({ ...editData, level: parseInt(e.target.value) })}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="isAdmin"
                                  checked={editData.isAdmin || false}
                                  onChange={(e) => setEditData({ ...editData, isAdmin: e.target.checked })}
                                />
                                <Label htmlFor="isAdmin">Admin Access</Label>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                              <Button onClick={handleEditUser}>Save Changes</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
