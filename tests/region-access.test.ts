import assert from "node:assert/strict";
import test from "node:test";
import { Role } from "@prisma/client";
import { assignedRtId, canManageRwSettings, hasValidStaffAssignment, rtScopeWhere, StaffAccess, wargaScopeWhere } from "../src/lib/auth";

const access = (role: Role, wilayahRwId: string | null = null, wilayahRtId: string | null = null): StaffAccess => ({
  userId: "user-1",
  role: role as StaffAccess["role"],
  wilayahRwId,
  wilayahRtId,
});

test("Admin mendapat cakupan seluruh wilayah", () => {
  assert.deepEqual(rtScopeWhere(access("ADMIN")), {});
  assert.deepEqual(wargaScopeWhere(access("ADMIN")), {});
});

test("Pengurus RT hanya mendapat cakupan RT tugasnya", () => {
  const rt = access("PENGURUS_RT", null, "rt-1");
  assert.deepEqual(rtScopeWhere(rt), { id: "rt-1" });
  assert.deepEqual(wargaScopeWhere(rt), { wilayahRtId: "rt-1" });
  assert.equal(assignedRtId(rt, "rt-lain"), "rt-1");
});

test("Pengurus RW membaca data di RW tugasnya, bukan RW lain", () => {
  const rw = access("PENGURUS_RW", "rw-1");
  assert.deepEqual(rtScopeWhere(rw), { rwId: "rw-1" });
  assert.deepEqual(wargaScopeWhere(rw), { wilayahRt: { is: { rwId: "rw-1" } } });
  assert.throws(() => assignedRtId(rw, "rt-1"), /Pengurus RW tidak dapat mengubah/);
});

test("Admin harus memilih RT saat membuat data operasional", () => {
  assert.equal(assignedRtId(access("ADMIN"), "rt-2"), "rt-2");
  assert.throws(() => assignedRtId(access("ADMIN")), /Wilayah RT wajib dipilih/);
});

test("Pengurus dengan penugasan kosong atau tipe wilayah tercampur ditolak", () => {
  assert.equal(hasValidStaffAssignment(access("PENGURUS_RW", null)), false);
  assert.equal(hasValidStaffAssignment(access("PENGURUS_RW", "rw-1", "rt-1")), false);
  assert.equal(hasValidStaffAssignment(access("PENGURUS_RT", null, null)), false);
  assert.equal(hasValidStaffAssignment(access("PENGURUS_RT", "rw-1", "rt-1")), false);
  assert.equal(hasValidStaffAssignment(access("PENGURUS_RW", "rw-1")), true);
  assert.equal(hasValidStaffAssignment(access("PENGURUS_RT", null, "rt-1")), true);
});

test("pengaturan RW hanya dapat dikelola Admin atau Pengurus RW pemilik", () => {
  assert.equal(canManageRwSettings(access("ADMIN"), "rw-lain", null), true);
  assert.equal(canManageRwSettings(access("PENGURUS_RW", "rw-1"), "rw-1", "user-1"), true);
  assert.equal(canManageRwSettings(access("PENGURUS_RW", "rw-1"), "rw-1", "user-lain"), false);
  assert.equal(canManageRwSettings(access("PENGURUS_RW", "rw-1"), "rw-lain", "user-1"), false);
  assert.equal(canManageRwSettings(access("PENGURUS_RT", null, "rt-1"), "rw-1", "user-1"), false);
});
