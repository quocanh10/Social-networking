// client/my-app/src/app/components/SearchModal.jsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar } from "@nextui-org/react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import VerifiedIcon from "@mui/icons-material/Verified";
import { client } from "@/app/helpers/fetch_api/client";
import { getToken } from "@/app/actions/gettoken.action";
import { useRouter } from "next/navigation";

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchInputRef = useRef(null);
  const router = useRouter();
  const [userKey, setUserKey] = useState("");

  // Focus vào input khi modal mở
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Lấy userId khi mở modal
  useEffect(() => {
    const fetchUserKey = async () => {
      const { accessToken } = await getToken();
      if (accessToken?.value) {
        client.setToken(accessToken.value);
        const res = await client.get("/profile");
        if (res.data?.data?.user?.id) {
          setUserKey(`recentSearches_${res.data.data.user.id}`);
        }
      }
    };
    if (isOpen) fetchUserKey();
  }, [isOpen]);

  // Load recent searches từ localStorage theo userKey
  useEffect(() => {
    if (!userKey) return;
    const saved = localStorage.getItem(userKey);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        setRecentSearches([]);
      }
    } else {
      setRecentSearches([]);
    }
  }, [userKey]);

  // Debounce search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        performSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 500); // Tăng delay để tránh quá nhiều request

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const performSearch = async (query) => {
    try {
      setIsLoading(true);
      const { accessToken } = await getToken();

      if (accessToken?.value) {
        client.setToken(accessToken.value);
        const response = await client.get(
          `/users/search?q=${encodeURIComponent(query)}`
        );

        console.log("Search response:", response);

        if (response.data.message === "Tìm kiếm thành công") {
          setSearchResults(response.data.data.users);
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Khi lưu lịch sử
  const handleUserClick = (user) => {
    const updatedRecent = [
      user,
      ...recentSearches.filter((item) => item.id !== user.id),
    ].slice(0, 10);
    setRecentSearches(updatedRecent);
    if (userKey) {
      localStorage.setItem(userKey, JSON.stringify(updatedRecent));
    }
    router.push(`/main/profile/${user.username}`);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (userKey) {
      localStorage.removeItem(userKey);
    }
  };

  const removeRecentSearch = (userId) => {
    const updated = recentSearches.filter((item) => item.id !== userId);
    setRecentSearches(updated);
    if (userKey) {
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tìm kiếm</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Đang tìm kiếm...</p>
            </div>
          ) : searchTerm.trim().length > 0 ? (
            // Search Results
            <div>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                  >
                    <Avatar
                      size="md"
                      src={
                        user.avatar_url || "https://i.pravatar.cc/150?u=default"
                      }
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm truncate">
                          {user.username}
                        </span>
                        {user.tick_blue && (
                          <VerifiedIcon
                            className="text-blue-500"
                            fontSize="small"
                          />
                        )}
                      </div>
                      <p className="text-gray-500 text-sm truncate">
                        {user.fullname}
                      </p>
                      {user.intro && (
                        <p className="text-gray-400 text-xs truncate">
                          {user.intro}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <SearchIcon className="mx-auto mb-2 text-4xl" />
                  <p>Không tìm thấy kết quả nào</p>
                  <p className="text-sm">Hãy thử từ khóa khác</p>
                </div>
              )}
            </div>
          ) : (
            // Recent Searches
            <div>
              {recentSearches.length > 0 ? (
                <>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-semibold text-sm">Gần đây</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-blue-500 text-sm hover:text-blue-700"
                    >
                      Xóa tất cả
                    </button>
                  </div>
                  {recentSearches.map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                    >
                      <div
                        onClick={() => handleUserClick(user)}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Avatar
                          size="md"
                          src={
                            user.avatar_url ||
                            "https://i.pravatar.cc/150?u=default"
                          }
                          className="flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-sm truncate">
                              {user.username}
                            </span>
                            {user.tick_blue && (
                              <VerifiedIcon
                                className="text-blue-500"
                                fontSize="small"
                              />
                            )}
                          </div>
                          <p className="text-gray-500 text-sm truncate">
                            {user.fullname}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(user.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded-full"
                      >
                        <CloseIcon fontSize="small" className="text-gray-400" />
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <SearchIcon className="mx-auto mb-2 text-4xl" />
                  <p className="text-lg font-medium">Tìm kiếm người dùng</p>
                  <p className="text-sm mt-1">
                    Bắt đầu nhập để tìm kiếm bạn bè
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
