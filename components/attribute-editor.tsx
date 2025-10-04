"use client"

import { useState, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, RefreshCw, Check, ChevronDown, ChevronUp } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const AttributeItem = memo(
  ({
    attr,
    globalIndex,
    attributeOptions,
    onUpdate,
  }: {
    attr: any
    globalIndex: number
    attributeOptions: AttributeOption[]
    onUpdate: (index: number, field: "value" | "attrId", newValue: any) => void
  }) => {
    return (
      <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
        <Label className="text-sm font-mono min-w-[60px]">id: {attr.attrId}</Label>
        <Input
          type="number"
          value={attr.value}
          onChange={(e) => onUpdate(globalIndex, "value", e.target.value)}
          className="w-24"
        />
        <Select
          value={attr.attrId.toString()}
          onValueChange={(value) => onUpdate(globalIndex, "attrId", Number.parseInt(value))}
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
  },
)
AttributeItem.displayName = "AttributeItem"

const EquipmentCard = memo(
  ({
    group,
    attributes,
    attributeOptions,
    onUpdate,
    isExpanded,
    onToggle,
  }: {
    group: any
    attributes: any[]
    attributeOptions: AttributeOption[]
    onUpdate: (index: number, field: "value" | "attrId", newValue: any) => void
    isExpanded: boolean
    onToggle: () => void
  }) => {
    return (
      <Card>
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Trang bị {group.equipmentName} - thuộc tính: ({group.attributes.length})
            </CardTitle>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-3">
            {group.attributes.map((attr: any, index: number) => {
              const globalIndex = attributes.findIndex(
                (a) => a.equipIndex === attr.equipIndex && a.attrIndex === attr.attrIndex,
              )
              return (
                <AttributeItem
                  key={`${attr.equipIndex}-${attr.attrIndex}`}
                  attr={attr}
                  globalIndex={globalIndex}
                  attributeOptions={attributeOptions}
                  onUpdate={onUpdate}
                />
              )
            })}
          </CardContent>
        )}
      </Card>
    )
  },
)
EquipmentCard.displayName = "EquipmentCard"

export function AttributeEditor({ attributeOptions, equipmentOptions }: AttributeEditorProps) {
  const [inputData, setInputData] = useState("")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [attributes, setAttributes] = useState<any[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const { toast } = useToast()

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
      const firstThreeKeys = Array.from(
        new Set(newAttributes.map((attr) => `${attr.equipIndex}-${attr.equipmentName}`)),
      ).slice(0, 3)
      setExpandedCards(new Set(firstThreeKeys))
    } catch (error) {
      alert("Dữ liệu JSON không hợp lệ")
    }
  }

  const updateAttribute = (index: number, field: "value" | "attrId", newValue: any) => {
    const updated = [...attributes]
    updated[index][field] = newValue
    setAttributes(updated)
  }

  const copyToClipboard = async () => {
    const exportData = JSON.parse(JSON.stringify(parsedData))

    attributes.forEach((attr) => {
      const { equipIndex, attrIndex, attrId, value } = attr
      exportData[equipIndex][16][attrIndex][0] = attrId
      exportData[equipIndex][16][attrIndex][1] = Number.parseInt(value)
    })

    const jsonOutput = JSON.stringify(exportData, null, 2)

    try {
      await navigator.clipboard.writeText(jsonOutput)
      setIsCopied(true)
      toast({
        title: "Đã sao chép!",
        description: "JSON đã được sao chép vào clipboard",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể sao chép vào clipboard",
        variant: "destructive",
      })
    }
  }

  const groupedAttributes = useMemo(() => {
    return attributes.reduce((acc: any, attr) => {
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
  }, [attributes])

  const toggleCard = (key: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  const expandAll = () => {
    setExpandedCards(new Set(Object.keys(groupedAttributes)))
  }

  const collapseAll = () => {
    setExpandedCards(new Set())
  }

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
          <div className="flex gap-2">
            {attributes.length > 0 && (
              <>
                <Button onClick={expandAll} variant="outline" size="sm">
                  Mở tất cả
                </Button>
                <Button onClick={collapseAll} variant="outline" size="sm">
                  Đóng tất cả
                </Button>
              </>
            )}
            <Button onClick={copyToClipboard} disabled={attributes.length === 0} size="lg">
              {isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Sao chép JSON
                </>
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[550px] border rounded-lg">
          <div className="p-4 space-y-4">
            {Object.entries(groupedAttributes).map(([key, group]: [string, any]) => (
              <EquipmentCard
                key={key}
                group={group}
                attributes={attributes}
                attributeOptions={attributeOptions}
                onUpdate={updateAttribute}
                isExpanded={expandedCards.has(key)}
                onToggle={() => toggleCard(key)}
              />
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
