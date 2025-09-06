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
  Calendar,
  User,
  ArrowLeft,
  Send,
  Shield,
  Image as ImageIcon
} from "lucide-react";

interface Comment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  text: string;
  createdAt: string;
  isOfficial: boolean;
}

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
  comments: Comment[];
  reportedBy: {
    _id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  estimatedResolutionDate?: string;
}

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [issueLoading, setIssueLoading] = useState(true);
  const [issueError, setIssueError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  // Set page title
  useEffect(() => {
    if (issue) {
      document.title = `${issue.title} – CivicSync`;
    } else {
      document.title = 'Issue Details – CivicSync';
    }
  }, [issue]);

  // Fetch issue details
  useEffect(() => {
    if (params.id) {
      fetchIssue();
    }
  }, [params.id]);

  const fetchIssue = async () => {
    try {
      setIssueLoading(true);
      setIssueError(null);

      const response = await fetch(`/api/issues/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setIssue(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch issue');
      }
    } catch (error) {
      console.error('Error fetching issue:', error);
      setIssueError(error instanceof Error ? error.message : 'Failed to fetch issue');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to add comments');
      router.push('/auth/login');
      return;
    }

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/issues/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: newComment.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setNewComment("");
        // Refresh the issue to get updated comments
        await fetchIssue();
      } else {
        throw new Error(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      alert('Please log in to upvote issues');
      router.push('/auth/login');
      return;
    }

    if (!issue) return;

    try {
      setUpvoting(true);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/issues/${issue._id}/upvote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update the issue in the local state
        setIssue(prevIssue => {
          if (!prevIssue) return null;
          return {
            ...prevIssue,
            upvotes: data.data.upvoted
              ? [...prevIssue.upvotes, user._id]
              : prevIssue.upvotes.filter(id => id !== user._id)
          };
        });
      } else {
        throw new Error(data.message || 'Failed to upvote issue');
      }
    } catch (error) {
      console.error('Error upvoting issue:', error);
      alert('Failed to upvote issue. Please try again.');
    } finally {
      setUpvoting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'acknowledged':
        return <Eye className="h-5 w-5 text-blue-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpvoted = user && issue ? issue.upvotes.includes(user._id) : false;

  if (issueLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomepageNavigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading issue details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (issueError || !issue) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HomepageNavigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Issue Not Found</h3>
            <p className="text-gray-600 mb-6">{issueError || 'The issue you are looking for does not exist.'}</p>
            <Link href="/community-issues" className="btn btn-primary">
              Back to Community Issues
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomepageNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/community-issues" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community Issues
          </Link>
        </div>

        {/* Issue Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{issue.title}</h1>
              <p className="text-gray-600 text-lg mb-4">{issue.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {issue.location}
                </span>
                <span>Category: {issue.category}</span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {issue.reportedBy.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(issue.createdAt)}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(issue.status)}`}>
                {getStatusIcon(issue.status)}
                <span className="capitalize">{issue.status.replace('_', ' ')}</span>
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                {issue.priority} priority
              </span>
            </div>
          </div>

          {/* Images */}
          {issue.images && issue.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Photos ({issue.images.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {issue.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${image.url}`}
                      alt={`Issue photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Notes */}
          {issue.resolutionNotes && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Resolution
              </h3>
              <p className="text-green-800 mb-2">{issue.resolutionNotes}</p>
              {issue.resolvedAt && (
                <p className="text-sm text-green-600">
                  Resolved on {formatDate(issue.resolvedAt)}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <button
                onClick={handleUpvote}
                disabled={upvoting}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isUpvoted
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${upvoting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <ThumbsUp className={`h-4 w-4 ${isUpvoted ? 'fill-current' : ''}`} />
                {upvoting ? 'Upvoting...' : `${issue.upvotes.length} upvotes`}
              </button>
              <span className="flex items-center gap-2 text-gray-600">
                <MessageSquare className="h-4 w-4" />
                {issue.comments.length} comments
              </span>
            </div>
            {issue.assignedTo && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Assigned to:</span> {issue.assignedTo.name}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Comments</h2>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm"
                    disabled={submittingComment}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm h-fit"
                >
                  {submittingComment ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  {submittingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-3">Please log in to add comments</p>
              <Link href="/auth/login" className="btn btn-primary">
                Login to Comment
              </Link>
            </div>
          )}

          {/* Comments List */}
          {issue.comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {issue.comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.user.name}</span>
                        {comment.isOfficial && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            <Shield className="h-3 w-3" />
                            Official
                          </span>
                        )}
                        <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
