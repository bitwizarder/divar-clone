"use client";

import BulkRestoreAction from "@/app/components/ui/admin/Restore/BulkRestoreAction";
import SingleRestoreAction from "@/app/components/ui/admin/Restore/SingleRestoreAction";
import SingleDeleteAction from "@/app/components/ui/admin/SingleDeleteAction";
import BulkDeleteAction from "@/app/components/ui/admin/BulkDeleteAction";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { converterToJalali } from "@/app/helpers/date";
import { UserListResponse } from "@/app/types/user";

function UserTrashList({ users }: { users: UserListResponse }) {
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const allSelected =
    users.data.length > 0 && selectedIds.length === users.data.length;

  const someSelected =
    selectedIds.length > 0 && selectedIds.length < users.data.length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const toggleUser = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(users.data.map((user) => user.id));
  };

  if (!users.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-color bg-surface px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-hover text-icon">
          <i className="fa fa-trash text-xl"></i>
        </div>
        <h3 className="mt-4 text-base font-bold text-primary">
          سطل زباله خالی است
        </h3>
        <p className="mt-2 text-sm text-secondary">
          هیچ کاربر حذف‌شده‌ای وجود ندارد.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger bg-danger/5 p-4 text-danger">
          <i className="fa fa-exclamation-circle mt-0.5"></i>
          <div>
            <p className="font-medium">خطا</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Bulk Restore */}
      <BulkRestoreAction
        selectedIds={selectedIds}
        endpoint="/api/admin/users/user/trash/restore"
        title="بازیابی کاربرها"
        itemName={`${selectedIds.length} کاربر`}
        description={`آیا از بازیابی ${selectedIds.length} کاربر انتخاب‌شده مطمئن هستید؟`}
        warning="کاربرهای انتخاب‌شده از سطل زباله خارج و به لیست اصلی بازگردانده می‌شوند."
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/user/trash?restoresSuccess=1");
        }}
        onError={(message) => setError(message)}
      />

      {/* Bulk Permanent Delete */}
      <BulkDeleteAction
        selectedIds={selectedIds}
        endpoint="/api/admin/users/user/trash"
        title="حذف دائمی کاربرها"
        itemName={`${selectedIds.length} کاربر`}
        description={`آیا از حذف دائمی ${selectedIds.length} کاربر انتخاب‌شده مطمئن هستید؟`}
        warning="هشدار: این عملیات غیرقابل بازگشت است و کاربران برای همیشه از پایگاه داده حذف خواهند شد."
        deleteButtonText="حذف دائمی انتخاب‌شده‌ها"
        confirmText="بله، برای همیشه حذف شوند"
        cancelText="انصراف"
        onSuccess={() => {
          setSelectedIds([]);
          setError(null);
          router.push("/admin/user/trash?forceDeletesSuccess=1");
          router.refresh();
        }}
        onError={(message) => setError(message)}
      />

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-color bg-surface text-primary shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-right">
            <thead>
              <tr className="border-b border-color bg-surface">
                <th className="w-14 px-3 py-4">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="انتخاب همه"
                    className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
                  />
                </th>
                <th className="px-3 py-4 text-xs font-semibold">ردیف</th>
                <th className="px-3 py-4 text-xs font-semibold">شناسه</th>
                <th className="px-3 py-4 text-xs font-semibold">نام</th>
                <th className="px-3 py-4 text-xs font-semibold">ایمیل</th>
                <th className="px-3 py-4 text-xs font-semibold">موبایل</th>
                <th className="px-3 py-4 text-xs font-semibold">نقش</th>
                <th className="px-3 py-4 text-xs font-semibold">وضعیت</th>
                <th className="px-3 py-4 text-xs font-semibold">تاریخ حذف</th>
                <th className="px-3 py-4 text-xs font-semibold">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.data.map((user, index) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-color last:border-0 hover:bg-hover ${
                      isSelected ? "bg-hover" : ""
                    }`}
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUser(user.id)}
                        aria-label={`انتخاب ${user.name}`}
                        className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover transition-all checked:border-accent checked:bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:font-bold before:text-sm before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100 focus:ring-0"
                      />
                    </td>
                    <td className="px-3 py-4 text-sm text-gray">
                      <span className="font-bold">{index + 1}</span>
                    </td>
                    <td className="px-3 py-4">
                      <span className="rounded-lg bg-hover px-2.5 py-1 text-xs font-medium">
                        #{user.id}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                          <i
                            className={
                              user.user_type === 1
                                ? "fa fa-user-gear"
                                : "fa fa-user"
                            }
                          ></i>
                        </div>
                        <p className="font-semibold text-primary">
                          {user.name || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="max-w-xs px-3 py-4">
                      <p className="line-clamp-2 text-sm text-secondary">
                        {user.email || "-"}
                      </p>
                    </td>
                    <td className="max-w-xs px-3 py-4">
                      <p className="line-clamp-2 text-sm text-secondary">
                        {user.mobile || "-"}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <span className="text-sm text-secondary">
                        {user.user_type === 1 ? "ادمین" : "کاربر"}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-50/5 dark:text-green-500">
                          <span className="h-2 w-2 rounded-full bg-success"></span>
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 dark:bg-red-50/5 dark:text-red-400/90">
                          <span className="h-2 w-2 rounded-full bg-danger"></span>
                          غیرفعال
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-secondary">
                      {converterToJalali(user.deleted_at)}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <SingleRestoreAction
                          endpoint={`/api/admin/users/user/trash/${user.id}/restore`}
                          title="بازیابی کاربر"
                          itemName={user.name || "کاربر"}
                          itemId={user.id}
                          icon={user.user_type === 1 ? "fa fa-user-gear" : "fa fa-user"}
                          onSuccess={() => {
                            setError(null);
                            router.push("/admin/user/trash?restoreSuccess=1");
                            router.refresh();
                          }}
                          onError={(message) => setError(message)}
                        />
                        <SingleDeleteAction
                          endpoint={`/api/admin/users/user/trash/${user.id}`}
                          title="حذف دائمی کاربر"
                          itemName={user.name || "کاربر"}
                          itemId={user.id}
                          icon="fa fa-trash"
                          description="آیا از حذف دائمی این کاربر مطمئن هستید؟"
                          warning="هشدار: این عملیات غیرقابل بازگشت است."
                          deleteButtonText="حذف دائمی"
                          confirmText="بله، برای همیشه حذف شود"
                          cancelText="انصراف"
                          onSuccess={() => {
                            setSelectedIds((prev) =>
                              prev.filter((id) => id !== user.id)
                            );
                            setError(null);
                            router.push("/admin/user/trash?forceDeleteSuccess=1");
                            router.refresh();
                          }}
                          onError={(message) => setError(message)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        <div className="flex items-center justify-between rounded-2xl border border-color bg-surface px-4 py-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label="انتخاب همه"
              className="appearance-none relative h-5 w-5 cursor-pointer rounded border border-color bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-sm before:font-bold before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100"
            />
            <span className="text-sm font-medium text-primary">انتخاب همه</span>
          </label>
          <span className="text-xs text-muted">
            {selectedIds.length > 0
              ? `${selectedIds.length} انتخاب شده`
              : `${users.data.length} مورد`}
          </span>
        </div>

        {users.data.map((user) => {
          const isSelected = selectedIds.includes(user.id);
          return (
            <div
              key={user.id}
              className={`rounded-2xl border border-color bg-surface p-4 shadow-sm ${
                isSelected ? "bg-hover" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleUser(user.id)}
                  aria-label={`انتخاب ${user.name}`}
                  className="appearance-none relative mt-1 h-5 w-5 shrink-0 cursor-pointer rounded border border-color bg-hover before:absolute before:inset-0 before:flex before:items-center before:justify-center before:text-sm before:font-bold before:text-accent before:opacity-0 before:content-['✓'] checked:before:opacity-100"
                />
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-hover text-icon">
                  <i
                    className={
                      user.user_type === 1 ? "fa fa-user-gear" : "fa fa-user"
                    }
                  ></i>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-primary">
                    {user.name || "-"}
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-1 ms-2 rounded-full ${
                        user.user_type === 1
                          ? "bg-accent text-white"
                          : "bg-hover text-secondary"
                      }`}
                    >
                      {user.user_type === 1 ? "ادمین" : "کاربر عادی"}
                    </span>
                  </h3>
                  <p className="mt-1 text-xs text-muted">شناسه #{user.id}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">ایمیل</p>
                  <p className="mt-1 text-sm line-clamp-3 leading-6 text-secondary">
                    {user.email || "ایمیلی ثبت نشده"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">موبایل</p>
                  <p className="mt-1 text-sm line-clamp-3 leading-6 text-secondary">
                    {user.mobile || "موبایلی ثبت نشده"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">وضعیت</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {user.is_active ? "فعال" : "غیرفعال"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <p className="text-xs text-muted">تاریخ حذف</p>
                  <p className="mt-1 text-sm font-medium text-secondary">
                    {converterToJalali(user.deleted_at)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-color pt-4">
                <SingleRestoreAction
                  endpoint={`/api/admin/users/user/trash/${user.id}/restore`}
                  title="بازیابی کاربر"
                  itemName={user.name || "کاربر"}
                  itemId={user.id}
                  extraClasses="flex-1"
                  btnText="بازیابی"
                  onSuccess={() => {
                    router.push("/admin/user/trash?restoreSuccess=1");
                    router.refresh();
                  }}
                  onError={(message) => setError(message)}
                />
                <SingleDeleteAction
                  endpoint={`/api/admin/users/user/trash/${user.id}`}
                  title="حذف دائمی کاربر"
                  itemName={user.name || "کاربر"}
                  itemId={user.id}
                  icon="fa fa-trash"
                  btnText="حذف"
                  extraClasses="flex-1"
                  description="آیا از حذف دائمی این کاربر مطمئن هستید؟"
                  warning="این عملیات غیرقابل بازگشت است."
                  deleteButtonText="حذف دائمی"
                  confirmText="بله، برای همیشه حذف شود"
                  cancelText="انصراف"
                  onSuccess={() => {
                    router.push("/admin/user/trash?forceDeleteSuccess=1");
                    router.refresh();
                  }}
                  onError={(message) => setError(message)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default UserTrashList;