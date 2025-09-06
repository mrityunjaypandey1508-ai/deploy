"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HomepageNavigation from "@/components/HomepageNavigation";
import { Shield, Search, RefreshCw, Calendar, User, MapPin } from "lucide-react";

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  reportedBy: { _id: string; name: string; email: string };
  assignedTo?: { _id: string; name: string; email: string };
  createdAt: string;
}

export default function OfficialDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Officials – CivicSync';
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (user.role !== 'official' && user.role !== 'admin') {
        router.replace('/');
      } else {
        fetchIssues();
      }
    }
  }, [user, loading]);

  const fetchIssues = async () => {
    try {
      setFetching(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      const url = new URL('/api/issues/admin', window.location.origin);
      const params = new URLSearchParams();
      if (q) params.set('search', q);
      if (status !== 'all') params.set('status', status);
      if (category !== 'all') params.set('category', category);
      if (priority !== 'all') params.set('priority', priority);
      url.search = params.toString();

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setIssues(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch issues');
      }
    } catch (e:any) {
      setError(e.message || 'Failed to fetch');
    } finally {
      setFetching(false);
    }
  };

  const updateStatus = async (id: string, newStatus: Issue['status']) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/issues/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to update');
      await fetchIssues();
    } catch (e:any) {
      alert(e.message || 'Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return issues;
  }, [issues]);

  const getStatusBadge = (s: string) => {
    const map: any = {
      submitted: 'bg-yellow-100 text-yellow-800',
      acknowledged: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return map[s] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HomepageNavigation />

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-600" />
            <h1 className="text-xl font-semibold">Officials Dashboard</h1>
          </div>
          <button onClick={fetchIssues} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-3 py-2 border rounded-md" />
            </div>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded-md px-3 py-2">
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded-md px-3 py-2">
              <option value="all">All Categories</option>
              <option>Potholes</option>
              <option>Broken Street Lights</option>
              <option>Garbage Collection</option>
              <option>Water Issues</option>
              <option>Road Damage</option>
              <option>Public Safety</option>
              <option>Traffic Issues</option>
              <option>Other</option>
            </select>
            <select value={priority} onChange={e=>setPriority(e.target.value)} className="border rounded-md px-3 py-2">
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="mt-3">
            <button onClick={fetchIssues} className="btn btn-primary">Apply Filters</button>
          </div>
        </div>

        <div className="space-y-3">
          {fetching && <div className="text-gray-500">Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!fetching && filtered.length === 0 && <div className="text-gray-600">No issues found.</div>}
          {filtered.map((issue)=> (
            <div key={issue._id} className="bg-white border rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{issue.title}</h3>
                  <p className="text-gray-600 mb-2">{issue.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {issue.location}</span>
                    <span>Category: {issue.category}</span>
                    <span>Priority: {issue.priority}</span>
                    <span className={`px-2 py-1 rounded-full bg-gray-100 text-gray-800`}>{issue.status.replace('_',' ')}</span>
                    <span className="flex items-center gap-1"><User className="h-4 w-4"/> {issue.reportedBy?.name}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {new Date(issue.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <select disabled={updatingId===issue._id} onChange={(e)=>updateStatus(issue._id, e.target.value as any)} defaultValue={issue.status} className="border rounded-md px-2 py-1 text-sm">
                    <option value="submitted">Submitted</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Link href={`/issues/${issue._id}`} className="text-primary-600">View details →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}



