import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getSignedPhotoUrls } from "@/lib/storage/student-photos";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Th, Td, EmptyState } from "@/components/ui/table";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function TeacherStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const user = await requireRole("teacher");
  const { class: classParam } = await searchParams;
  const supabase = await createClient();

  const { data: classRows } = await supabase
    .from("class_teachers")
    .select("classes(id, name, section)")
    .eq("teacher_id", user.id);

  const classes = (classRows ?? [])
    .map((c) => c.classes)
    .filter((c): c is NonNullable<typeof c> => !!c);

  const classIds = classParam ? [classParam] : classes.map((c) => c.id);

  const { data: students } = classIds.length
    ? await supabase
        .from("students")
        .select("id, student_code, full_name, photo_url, classes(name, section)")
        .in("class_id", classIds)
        .eq("is_active", true)
        .order("full_name")
    : { data: [] };

  const photoUrls = await getSignedPhotoUrls(
    supabase,
    students?.map((s) => s.photo_url) ?? [],
  );

  return (
    <div>
      <PageHeader title="Students" description="Students in your assigned classes" />

      {classes.length > 0 ? (
        <form method="GET" className="mb-4 flex max-w-md gap-2">
          <Select name="class" defaultValue={classParam ?? ""} className="flex-1">
            <option value="">All my classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.section ? ` - ${c.section}` : ""}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>
      ) : null}

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
                </tr>
              </Thead>
              <Tbody>
                {students.map((s) => (
                  <tr key={s.id}>
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
                    <Td>{s.student_code}</Td>
                    <Td>{s.full_name}</Td>
                    <Td>
                      {s.classes
                        ? `${s.classes.name}${s.classes.section ? ` - ${s.classes.section}` : ""}`
                        : "—"}
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
