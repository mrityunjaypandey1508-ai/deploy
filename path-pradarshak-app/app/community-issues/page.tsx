"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HomepageNavigation from "@/components/HomepageNavigation";
import { 
  AlertTriangle, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  ThumbsUp,
  MapPin,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  images: Array<{
    url: string;
    filename: string;
    uploadedAt: string;
  }>;
  upvotes: string[];
  comments: Array<{
    user: string;
    text: string;
    createdAt: string;
    isOfficial: boolean;
  }>;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export default function CommunityIssuesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [upvotingIssues, setUpvotingIssues] = useState<Set<string>>(new Set());

  // Set page title
  useEffect(() => {
    document.title = 'Community Issues – CivicSync';
  }, []);

  // Fetch community issues
  useEffect(() => {
    fetchIssues();
  }, []);

  // Filter issues based on search and filters
  useEffect(() => {
    let filtered = [...issues];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => issue.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter(issue => issue.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(issue => issue.category === categoryFilter);
    }

    // Sort issues
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most_upvoted":
          return b.upvotes.length - a.upvotes.length;
        case "most_commented":
          return b.comments.length - a.comments.length;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    setFilteredIssues(filtered);
  }, [issues, searchTerm, statusFilter, priorityFilter, categoryFilter, sortBy]);

  const fetchIssues = async () => {
    try {
      setIssuesLoading(true);
      setIssuesError(null);

      const response = await fetch('/api/issues');

      const data = await response.json();

      if (data.success) {
        setIssues(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch issues');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssuesError(error instanceof Error ? error.message : 'Failed to fetch issues');
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleUpvote = async (issueId: string) => {
    if (!user) {
      alert('Please log in to upvote issues');
      router.push('/auth/login');
      return;
    }

    try {
      setUpvotingIssues(prev => new Set(prev).add(issueId));

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update the issue in the local state
        setIssues(prevIssues =>
          prevIssues.map(issue =>
            issue._id === issueId
              ? {
                  ...issue,
                  upvotes: data.data.upvoted
                    ? [...issue.upvotes, user._id]
                    : issue.upvotes.filter(id => id !== user._id)
                }
              : issue
          )
        );
      } else {
        throw new Error(data.message || 'Failed to upvote issue');
      }
    } catch (error) {
      console.error('Error upvoting issue:', error);
      alert('Failed to upvote issue. Please try again.');
    } finally {
      setUpvotingIssues(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'acknowledged':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusCounts = () => {
    const counts = {
      all: issues.length,
      submitted: issues.filter(i => i.status === 'submitted').length,
      acknowledged: issues.filter(i => i.status === 'acknowledged').length,
      in_progress: issues.filter(i => i.status === 'in_progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      closed: issues.filter(i => i.status === 'closed').length
    };
    return counts;
  };

  const categories = [
    'Potholes',
    'Broken Street Lights',
    'Garbage Collection',
    'Water Issues',
    'Road Damage',
    'Public Safety',
    'Traffic Issues',
    'Other'
  ];

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      <HomepageNavigation />
      <div className="h-16"></div>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Community Issues</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchIssues}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              {user ? (
                <Link href="/issues/report" className="btn btn-primary flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Report Issue
                </Link>
              ) : (
                <Link href="/auth/login" className="btn btn-outline">
                  Login to Report
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{statusCounts.all}</div>
            <div className="text-sm text-gray-600">Total Issues</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.submitted}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{statusCounts.acknowledged}</div>
            <div className="text-sm text-gray-600">Acknowledged</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{statusCounts.in_progress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{statusCounts.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{statusCounts.closed}</div>
            <div className="text-sm text-gray-600">Closed</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="most_upvoted">Most Upvoted</option>
                <option value="most_commented">Most Commented</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Issues List */}
        {issuesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading community issues...</p>
          </div>
        ) : issuesError ? (
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{issuesError}</p>
            <button
              onClick={fetchIssues}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {issues.length === 0 ? "No community issues yet" : "No issues match your filters"}
            </h3>
            <p className="text-gray-600 mb-6">
              {issues.length === 0 
                ? "Be the first to report a civic issue in your community!"
                : "Try adjusting your search terms or filters to find what you're looking for."
              }
            </p>
            {user && issues.length === 0 && (
              <Link href="/issues/report" className="btn btn-primary">
                Report the First Issue
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => {
              const isUpvoted = user ? issue.upvotes.includes(user._id) : false;
              const isUpvoting = upvotingIssues.has(issue._id);
              
              return (
                <div key={issue._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{issue.title}</h3>
                      <p className="text-gray-600 mb-3">{issue.description}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {issue.location}
                        </span>
                        <span>Category: {issue.category}</span>
                        <span>Reported by: {issue.reportedBy.name}</span>
                        <span>Posted: {formatDate(issue.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                        {getStatusIcon(issue.status)}
                        <span className="ml-1 capitalize">{issue.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority} priority
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleUpvote(issue._id)}
                        disabled={isUpvoting}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                          isUpvoted
                            ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                            : 'hover:bg-gray-100'
                        } ${isUpvoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
                        {issue.upvotes.length} upvotes
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {issue.comments.length} comments
                      </span>
                      {issue.images.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {issue.images.length} photo{issue.images.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <Link 
                      href={`/issues/${issue._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>

                  {issue.resolutionNotes && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Resolution:</strong> {issue.resolutionNotes}
                      </p>
                      {issue.resolvedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Resolved on {formatDate(issue.resolvedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
