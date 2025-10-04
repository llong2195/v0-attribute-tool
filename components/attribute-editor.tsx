"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, RefreshCw } from "lucide-react"

interface AttributeOption {
  id: number
  name: string
  isPercent: number
  colorPaint: number
}

interface Equipment {
  id: number
  name: string
  [key: string]: any
}

interface AttributeEditorProps {
  attributeOptions: AttributeOption[]
  equipmentOptions: Equipment[]
}

export function AttributeEditor({ attributeOptions, equipmentOptions }: AttributeEditorProps) {
  const [inputData, setInputData] = useState("")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [attributes, setAttributes] = useState<any[]>([])

  const updatePreview = () => {
    try {
      const data = JSON.parse(inputData)
      setParsedData(data)

      const newAttributes: any[] = []
      data.forEach((equipment: any[], equipIndex: number) => {
        if (equipment.length <= 16) return

        const attrs = equipment[16]
        const itemId = equipment[1]
        const equipmentInfo = equipmentOptions.find((opt) => opt.id === itemId)

        attrs.forEach((attr: [number, number], attrIndex: number) => {
          const [attrId, value] = attr
          const attrOption = attributeOptions.find((opt) => opt.id === attrId)

          newAttributes.push({
            equipIndex,
            attrIndex,
            equipmentName: equipmentInfo?.name || `ID: ${itemId}`,
            attrId,
            attrName: attrOption?.name || `ID: ${attrId}`,
            value,
          })
        })
      })

      setAttributes(newAttributes)
    } catch (error) {
      alert("Dữ liệu JSON không hợp lệ")
    }
  }

  const updateAttribute = (index: number, field: "value" | "attrId", newValue: any) => {
    const updated = [...attributes]
    updated[index][field] = newValue
    setAttributes(updated)
  }

  const exportJSON = () => {
    const exportData = JSON.parse(JSON.stringify(parsedData))

    attributes.forEach((attr) => {
      const { equipIndex, attrIndex, attrId, value } = attr
      exportData[equipIndex][16][attrIndex][0] = attrId
      exportData[equipIndex][16][attrIndex][1] = Number.parseInt(value)
    })

    const jsonOutput = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonOutput], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "exported_attributes.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Group attributes by equipment
  const groupedAttributes = attributes.reduce((acc: any, attr) => {
    const key = `${attr.equipIndex}-${attr.equipmentName}`
    if (!acc[key]) {
      acc[key] = {
        equipmentName: attr.equipmentName,
        attributes: [],
      }
    }
    acc[key].attributes.push(attr)
    return acc
  }, {})

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="input" className="text-lg font-semibold">
            Input (array)
          </Label>
          <Textarea
            id="input"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Nhập dữ liệu JSON..."
            className="h-[500px] font-mono text-sm mt-2"
          />
        </div>
        <Button onClick={updatePreview} className="w-full" size="lg">
          <RefreshCw className="mr-2 h-4 w-4" />
          Cập nhật preview
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Preview</Label>
          <Button onClick={exportJSON} disabled={attributes.length === 0} size="lg">
            <Download className="mr-2 h-4 w-4" />
            Xuất JSON
          </Button>
        </div>

        <ScrollArea className="h-[550px] border rounded-lg">
          <div className="p-4 space-y-4">
            {Object.values(groupedAttributes).map((group: any, groupIndex: number) => (
              <Card key={groupIndex}>
                <CardHeader>
                  <CardTitle className="text-base">Trang bị {group.equipmentName} - thuộc tính:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {group.attributes.map((attr: any, index: number) => {
                    const globalIndex = attributes.findIndex(
                      (a) => a.equipIndex === attr.equipIndex && a.attrIndex === attr.attrIndex,
                    )
                    return (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                        <Label className="text-sm font-mono min-w-[60px]">id: {attr.attrId}</Label>
                        <Input
                          type="number"
                          value={attr.value}
                          onChange={(e) => updateAttribute(globalIndex, "value", e.target.value)}
                          className="w-24"
                        />
                        <Select
                          value={attr.attrId.toString()}
                          onValueChange={(value) => updateAttribute(globalIndex, "attrId", Number.parseInt(value))}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {attributeOptions.map((option) => (
                              <SelectItem key={option.id} value={option.id.toString()}>
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
            {attributes.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                Nhập dữ liệu và nhấn "Cập nhật preview" để bắt đầu
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
