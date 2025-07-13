import { useEffect, useState } from "react";
import ApiServices from "../../ApiServices";

export default function AdminDashBoard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await ApiServices.DashBoard();
        setDashboardData(response.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-rose-500"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-rose-500 mb-4">Data Unavailable</h2>
          <p className="text-gray-600">Could not fetch dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const { 
    message, 
    totalStudent, 
    totalSubjects, 
    totalCourses, 
    totalFlashcards, 
    totalRatings 
  } = dashboardData;

  // Dashboard metrics cards
  const metrics = [
    { title: "Students", value: totalStudent, icon: "👨‍🎓", color: "bg-gradient-to-r from-rose-400 to-rose-500" },
    { title: "Subjects", value: totalSubjects, icon: "📚", color: "bg-gradient-to-r from-violet-400 to-violet-500" },
    { title: "Courses", value: totalCourses, icon: "🎓", color: "bg-gradient-to-r from-blue-400 to-blue-500" },
    { title: "Flashcards", value: totalFlashcards, icon: "📇", color: "bg-gradient-to-r from-amber-400 to-amber-500" },
    { title: "Ratings", value: totalRatings, icon: "⭐", color: "bg-gradient-to-r from-emerald-400 to-emerald-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center">
            <div className="h-1 w-20 bg-rose-500 rounded-full mr-4"></div>
            <p className="text-xl text-gray-600">{message}</p>
          </div>
        </header>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          {metrics.map((metric, index) => (
            <div 
              key={index}
              className={`${metric.color} rounded-2xl shadow-lg overflow-hidden text-white transform transition-all duration-300 hover:scale-105`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-lg mt-1">{metric.title}</p>
                  </div>
                  <div className="text-4xl">{metric.icon}</div>
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full" 
                      style={{ width: `${Math.min(metric.value / 30 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Student Growth Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Student Growth</h2>
            <div className="h-64 flex items-end space-x-2">
              {[40, 60, 80, 100, 70, 90, 120].map((height, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-gradient-to-t from-rose-400 to-rose-300 rounded-t-lg transition-all duration-500 ease-out"
                    style={{ height: `${height}%` }}
                  ></div>
                  <span className="mt-2 text-xs text-gray-500">W{index+1}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Popular Subjects */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Popular Subjects</h2>
            <div className="space-y-4">
              {[
                { name: "Mathematics", students: 42, color: "bg-rose-400" },
                { name: "Science", students: 38, color: "bg-violet-400" },
                { name: "History", students: 32, color: "bg-blue-400" },
                { name: "Literature", students: 28, color: "bg-amber-400" },
                { name: "Art", students: 22, color: "bg-emerald-400" },
              ].map((subject, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">{subject.name}</span>
                    <span className="text-gray-500">{subject.students} students</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${subject.color} rounded-full`}
                      style={{ width: `${subject.students}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { user: "Alex Johnson", action: "completed Mathematics course", time: "2 mins ago" },
              { user: "Sam Wilson", action: "added new flashcards", time: "15 mins ago" },
              { user: "Taylor Swift", action: "rated Physics course 5 stars", time: "1 hour ago" },
              { user: "Jamie Smith", action: "enrolled in History course", time: "3 hours ago" },
              { user: "Jordan Lee", action: "completed Art assignment", time: "5 hours ago" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-400 to-rose-500 flex items-center justify-center text-white font-bold">
                    {activity.user.charAt(0)}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-gray-800">{activity.user}</p>
                  <p className="text-gray-600">{activity.action}</p>
                </div>
                <div className="ml-auto text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm py-6">
          <p>© {new Date().getFullYear()} Admin Dashboard. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}