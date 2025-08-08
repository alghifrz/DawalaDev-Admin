export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      {/* Sidebar Skeleton */}
      <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
        {/* Logo Section */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* Navigation Skeleton */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </nav>

        {/* User Info Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="space-y-1">
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="h-8 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Large Chart Area */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-4">
                                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Content */}
              <div className="space-y-6">
                {/* Device Analytics */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 