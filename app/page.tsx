import { AttributeEditor } from "@/components/attribute-editor"
import { attributeOptions } from "@/lib/data/attributes"
import { equipmentOptions } from "@/lib/data/equipment"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Attribute Tool - Công cụ chỉnh sửa thuộc tính</h1>
        <AttributeEditor attributeOptions={attributeOptions} equipmentOptions={equipmentOptions} />
      </div>
    </main>
  )
}
