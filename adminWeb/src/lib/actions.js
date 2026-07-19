"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL;

export async function registerAction(formData) {
  const data = Object.fromEntries(formData);
  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function loginAction(email, password) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // We handle redirect in the component
    });

    return result;
  } catch (error) {
    return { error: "Authentication failed" };
  }
}

export async function verifyEmailAction(token) {
  const res = await fetch(`${BACKEND_URL}/api/auth/verify/${encodeURIComponent(token)}`, {
    method: "GET",
  });
  return await res.json();
}

export async function resendVerificationAction(email) {
  const res = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await res.json();
}

export async function forgotPasswordAction(email) {
  const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, ...data };
}

export async function resetPasswordAction(token, password, confirmPassword) {
  const res = await fetch(`${BACKEND_URL}/api/auth/reset-password/${encodeURIComponent(token)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, confirmPassword }),
  });

  return await res.json();
}

async function getAuthenticatedSession() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return { error: "Not authenticated" };
  }

  return { session };
}

function getAuthHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };
}

async function fetchAdminApi(path, options = {}) {
  const authResult = await getAuthenticatedSession();
  if (authResult.error) {
    return { error: authResult.error };
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(authResult.session.accessToken),
        ...(options.headers || {})
      },
      cache: options.cache || "no-store"
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || "Request failed" };
    }

    return { data };
  } catch (_error) {
    return { error: "Network error" };
  }
}

export async function getAdminDashboardDetailsAction() {
  return fetchAdminApi("/api/admin/dashboard/details", { method: "GET" });
}

export async function getAdminUsersAction({ page = 1, limit = 10, search = "", role = "", status = "", isVerified } = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search) query.set("search", search);
  if (role) query.set("role", role);
  if (status) query.set("status", status);
  if (typeof isVerified === "boolean") query.set("isVerified", String(isVerified));

  return fetchAdminApi(`/api/admin/users?${query.toString()}`, { method: "GET" });
}

export async function createAdminUserAction(payload) {
  return fetchAdminApi("/api/admin/users", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAdminUserFormAction(_prevState, formData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "CUSTOMER");
  const isVerified = formData.get("isVerified") === "on";

  const submittedValues = {
    name,
    email,
    role,
    isVerified
  };

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters", success: false, values: submittedValues };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: "Invalid email format", success: false, values: submittedValues };
  }

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters", success: false, values: submittedValues };
  }

  if (!["ADMIN", "CUSTOMER"].includes(role)) {
    return { error: "Invalid role provided", success: false, values: submittedValues };
  }

  const result = await createAdminUserAction({
    name,
    email,
    password,
    role,
    isVerified
  });

  if (result.error) {
    return { error: result.error, success: false, values: submittedValues };
  }

  redirect("/admin/users");
}

export async function getAdminUserByIdAction(userId) {
  return fetchAdminApi(`/api/admin/users/${userId}`, { method: "GET" });
}

export async function updateAdminUserAction(userId, payload) {
  return fetchAdminApi(`/api/admin/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminUserRoleAction(userId, role) {
  return fetchAdminApi(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role })
  });
}

export async function setAdminUserVerificationAction(userId, isVerified) {
  return fetchAdminApi(`/api/admin/users/${userId}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ isVerified })
  });
}

export async function updateAdminUserStatusAction(userId, status) {
  return fetchAdminApi(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function deleteAdminUserAction(userId) {
  return updateAdminUserStatusAction(userId, "DELETED");
}

export async function getAdminUserStatsAction() {
  return fetchAdminApi("/api/admin/users/stats/summary", { method: "GET" });
}

export async function getAdminCategoriesAction({ page = 1, limit = 10, search = "", status = "" } = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search) query.set("search", search);
  if (status) query.set("status", status);

  return fetchAdminApi(`/api/admin/categories?${query.toString()}`, { method: "GET" });
}

export async function createAdminCategoryAction(payload) {
  return fetchAdminApi("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAdminCategoryByIdAction(categoryId) {
  return fetchAdminApi(`/api/admin/categories/${categoryId}`, { method: "GET" });
}

export async function updateAdminCategoryAction(categoryId, payload) {
  return fetchAdminApi(`/api/admin/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminCategoryStatusAction(categoryId, status) {
  return fetchAdminApi(`/api/admin/categories/${categoryId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function getAdminCategoryOptionsAction() {
  return fetchAdminApi("/api/admin/categories/options", { method: "GET" });
}

export async function getAdminProductsAction({
  page = 1,
  limit = 10,
  search = "",
  categoryId = "",
  status = "",
  isFeatured,
  sortBy = ""
} = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search) query.set("search", search);
  if (categoryId) query.set("categoryId", categoryId);
  if (status) query.set("status", status);
  if (typeof isFeatured === "boolean") query.set("isFeatured", String(isFeatured));
  if (sortBy) query.set("sortBy", sortBy);

  return fetchAdminApi(`/api/admin/products?${query.toString()}`, { method: "GET" });
}

export async function createAdminProductAction(payload) {
  return fetchAdminApi("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAdminProductByCodeAction(productCode) {
  return fetchAdminApi(`/api/admin/products/code/${encodeURIComponent(productCode)}`, {
    method: "GET"
  });
}

export async function getAdminProductByIdAction(productId) {
  return fetchAdminApi(`/api/admin/products/${productId}`, { method: "GET" });
}

export async function updateAdminProductAction(productId, payload) {
  return fetchAdminApi(`/api/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminProductStatusAction(productId, status) {
  return fetchAdminApi(`/api/admin/products/${productId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function getAdminOrdersAction({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  orderType = ""
} = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search) query.set("search", search);
  if (status) query.set("status", status);
  if (orderType) query.set("orderType", orderType);

  return fetchAdminApi(`/api/orders/admin?${query.toString()}`, { method: "GET" });
}

export async function getAdminOrderByIdAction(orderId) {
  return fetchAdminApi(`/api/orders/admin/${orderId}`, { method: "GET" });
}

export async function updateAdminOrderStatusAction(orderId, status) {
  return fetchAdminApi(`/api/orders/admin/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function getAdminProductReviewsAction(
  productId,
  { page = 1, limit = 10, status = "", search = "" } = {}
) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (status) query.set("status", status);
  if (search) query.set("search", search);

  return fetchAdminApi(`/api/admin/products/${productId}/reviews?${query.toString()}`, { method: "GET" });
}

export async function updateAdminReviewStatusAction(reviewId, status) {
  return fetchAdminApi(`/api/admin/reviews/${reviewId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function getAdminHeroSlidersAction({ page = 1, limit = 10, search = "", status = "" } = {}) {
  const query = new URLSearchParams();
  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search) query.set("search", search);
  if (status) query.set("status", status);

  return fetchAdminApi(`/api/admin/hero-sliders?${query.toString()}`, { method: "GET" });
}

export async function createAdminHeroSliderAction(payload) {
  return fetchAdminApi("/api/admin/hero-sliders", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAdminHeroSliderByIdAction(sliderId) {
  return fetchAdminApi(`/api/admin/hero-sliders/${sliderId}`, { method: "GET" });
}

export async function updateAdminHeroSliderAction(sliderId, payload) {
  return fetchAdminApi(`/api/admin/hero-sliders/${sliderId}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export async function updateAdminHeroSliderStatusAction(sliderId, status) {
  return fetchAdminApi(`/api/admin/hero-sliders/${sliderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export async function getAdminSiteSettingsAction() {
  return fetchAdminApi("/api/admin/settings", { method: "GET" });
}

export async function updateAdminSiteSettingsAction(payload) {
  return fetchAdminApi("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}





export async function getProfileAction() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return { error: "Not authenticated" };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: 'no-store' // Ensure we get fresh data
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Failed to fetch profile" };
    }

    return { data };
  } catch (error) {
    return { error: "Network error" };
  }
}

export async function getMyOrdersAction(limit = 8) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return { error: "Not authenticated" };
  }

  try {
    const query = new URLSearchParams();
    query.set("limit", String(limit));

    const res = await fetch(`${BACKEND_URL}/api/orders/mine?${query.toString()}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store"
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.message || "Failed to fetch order history" };
    }

    return { data: data.orders || [] };
  } catch (_error) {
    return { error: "Network error" };
  }
}

// Fixed loginAction: Usually signIn is called on the client side, 
// but if you keep it here, ensure it's exported correctly.
// Note: next-auth/react's signIn doesn't work inside "use server".
// Use the client-side handleSubmit logic we created earlier for Login.



