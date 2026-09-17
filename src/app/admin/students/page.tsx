import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/storage/student-photos";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StudentsFilterBar } from "@/components/students/students-filter-bar";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; class?: string; status?: string }>;
}) {
  await requireRole("admin");
  const { search, class: classId, status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select("id, student_code, full_name, photo_url, is_active, classes(name, section)")
    .order("full_name");

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,student_code.ilike.%${search}%`);
  }
  if (classId) {
    query = query.eq("class_id", classId);
  }
  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  const [{ data: students }, { data: classes }] = await Promise.all([
    query,
    supabase.from("classes").select("id, name, section").eq("is_active", true).order("name"),
  ]);

  const photoUrls = await getSignedPhotoUrls(
    supabase,
    students?.map((s) => s.photo_url) ?? [],
  );

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage student records"
        action={
          <Link href="/admin/students/new">
            <Button>Add Student</Button>
          </Link>
        }
      />

      <StudentsFilterBar classes={classes ?? []} />

      <Card>
        <CardBody className="p-0">
          {students && students.length > 0 ? (
            <Table>
              <Thead>
                <tr>
                  <Th></Th>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Class</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {students.map((s) => (
                  <tr
                    key={s.id}
                    className="cursor-pointer hover:bg-slate-50"
                  >
                    <Td className="w-12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          (s.photo_url && photoUrls.get(s.photo_url)) ||
                          "/avatar-placeholder.svg"
                        }
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {s.student_code}
                      </Link>
                    </Td>
                    <Td>{s.full_name}</Td>
                    <Td>
                      {s.classes ? `${s.classes.name}${s.classes.section ? ` - ${s.classes.section}` : ""}` : "—"}
                    </Td>
                    <Td>
                      <Badge tone={s.is_active ? "green" : "slate"}>
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <EmptyState message="No students found." />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
