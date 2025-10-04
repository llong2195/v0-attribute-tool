"use client"

import type React from "react"

import { useState, useMemo, memo, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, RefreshCw, Check, ChevronDown, ChevronUp, Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Combobox } from "@/components/ui/combobox"

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
    localIndex,
    totalInGroup,
    comboboxOptions,
    onUpdate,
    onMoveUp,
    onMoveDown,
    onDelete,
  }: {
    attr: any
    localIndex: number
    totalInGroup: number
    comboboxOptions: Array<{ value: string; label: string }>
    onUpdate: (equipIndex: number, attrIndex: number, field: "value" | "attrId", newValue: any) => void
    onMoveUp: (equipIndex: number, attrIndex: number) => void
    onMoveDown: (equipIndex: number, attrIndex: number) => void
    onDelete: (equipIndex: number, attrIndex: number) => void
  }) => {
    const handleValueChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(attr.equipIndex, attr.attrIndex, "value", e.target.value)
      },
      [attr.equipIndex, attr.attrIndex, onUpdate],
    )

    const handleAttrChange = useCallback(
      (value: string) => {
        onUpdate(attr.equipIndex, attr.attrIndex, "attrId", Number.parseInt(value))
      },
      [attr.equipIndex, attr.attrIndex, onUpdate],
    )

    const handleMoveUp = useCallback(() => {
      onMoveUp(attr.equipIndex, attr.attrIndex)
    }, [attr.equipIndex, attr.attrIndex, onMoveUp])

    const handleMoveDown = useCallback(() => {
      onMoveDown(attr.equipIndex, attr.attrIndex)
    }, [attr.equipIndex, attr.attrIndex, onMoveDown])

    const handleDelete = useCallback(() => {
      onDelete(attr.equipIndex, attr.attrIndex)
    }, [attr.equipIndex, attr.attrIndex, onDelete])

    return (
      <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
        <Label className="text-sm font-mono min-w-[60px]">id: {attr.attrId}</Label>
        <Input type="number" value={attr.value} onChange={handleValueChange} className="w-24" />
        <Combobox
          options={comboboxOptions}
          value={attr.attrId.toString()}
          onValueChange={handleAttrChange}
          placeholder="Chọn thuộc tính..."
          searchPlaceholder="Tìm kiếm..."
          emptyText="Không tìm thấy"
          className="flex-1"
        />
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleMoveUp} disabled={localIndex === 0}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleMoveDown}
            disabled={localIndex === totalInGroup - 1}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  },
)
AttributeItem.displayName = "AttributeItem"

const EquipmentCard = memo(
  ({
    equipIndex,
    equipmentName,
    attributes,
    comboboxOptions,
    onUpdate,
    onMoveUp,
    onMoveDown,
    onDelete,
    onAddAttribute,
    isExpanded,
    onToggle,
  }: {
    equipIndex: number
    equipmentName: string
    attributes: any[]
    comboboxOptions: Array<{ value: string; label: string }>
    onUpdate: (equipIndex: number, attrIndex: number, field: "value" | "attrId", newValue: any) => void
    onMoveUp: (equipIndex: number, attrIndex: number) => void
    onMoveDown: (equipIndex: number, attrIndex: number) => void
    onDelete: (equipIndex: number, attrIndex: number) => void
    onAddAttribute: (equipIndex: number) => void
    isExpanded: boolean
    onToggle: () => void
  }) => {
    const sortedAttributes = useMemo(() => {
      return [...attributes].sort((a, b) => a.attrIndex - b.attrIndex)
    }, [attributes])

    const handleAddAttribute = useCallback(() => {
      onAddAttribute(equipIndex)
    }, [equipIndex, onAddAttribute])

    return (
      <Card>
        <CardHeader className="cursor-pointer" onClick={onToggle}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Trang bị {equipmentName} - thuộc tính: ({attributes.length})
            </CardTitle>
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-3">
            {sortedAttributes.map((attr, index) => (
              <AttributeItem
                key={`${attr.equipIndex}-${attr.attrIndex}`}
                attr={attr}
                localIndex={index}
                totalInGroup={sortedAttributes.length}
                comboboxOptions={comboboxOptions}
                onUpdate={onUpdate}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onDelete={onDelete}
              />
            ))}
            <Button variant="outline" className="w-full bg-transparent" onClick={handleAddAttribute}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm thuộc tính
            </Button>
          </CardContent>
        )}
      </Card>
    )
  },
)
EquipmentCard.displayName = "EquipmentCard"

export function AttributeEditor({ attributeOptions, equipmentOptions }: AttributeEditorProps) {
  const [inputData, setInputData] = useState("")
  const [debouncedInput, setDebouncedInput] = useState("")
  const [parsedData, setParsedData] = useState<any[]>([])
  const [attributes, setAttributes] = useState<any[]>([])
  const [isCopied, setIsCopied] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  const comboboxOptions = useMemo(
    () =>
      attributeOptions.map((option) => ({
        value: option.id.toString(),
        label: option.name,
      })),
    [attributeOptions],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(inputData)
    }, 300)

    return () => clearTimeout(timer)
  }, [inputData])

  const updatePreview = useCallback(() => {
    try {
      const data = JSON.parse(debouncedInput)
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
      setExpandedCards(new Set())
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Dữ liệu JSON không hợp lệ",
        variant: "destructive",
      })
    }
  }, [debouncedInput, attributeOptions, equipmentOptions, toast])

  const updateAttribute = useCallback(
    (equipIndex: number, attrIndex: number, field: "value" | "attrId", newValue: any) => {
      setAttributes((prev) =>
        prev.map((attr) =>
          attr.equipIndex === equipIndex && attr.attrIndex === attrIndex ? { ...attr, [field]: newValue } : attr,
        ),
      )
    },
    [],
  )

  const moveAttributeUp = useCallback((equipIndex: number, attrIndex: number) => {
    setAttributes((prev) => {
      const equipmentAttrs = prev
        .filter((a) => a.equipIndex === equipIndex)
        .sort((a, b) => a.attrIndex - b.attrIndex)
        .map((a) => ({ ...a }))

      const currentIndex = equipmentAttrs.findIndex((a) => a.attrIndex === attrIndex)

      if (currentIndex === 0) return prev

      // Swap positions in the sorted array
      const temp = equipmentAttrs[currentIndex]
      equipmentAttrs[currentIndex] = equipmentAttrs[currentIndex - 1]
      equipmentAttrs[currentIndex - 1] = temp

      // Reassign attrIndex values sequentially
      equipmentAttrs.forEach((attr, idx) => {
        attr.attrIndex = idx
      })

      const otherAttrs = prev.filter((a) => a.equipIndex !== equipIndex)
      return [...otherAttrs, ...equipmentAttrs].sort((a, b) => a.equipIndex - b.equipIndex)
    })
  }, [])

  const moveAttributeDown = useCallback((equipIndex: number, attrIndex: number) => {
    setAttributes((prev) => {
      const equipmentAttrs = prev
        .filter((a) => a.equipIndex === equipIndex)
        .sort((a, b) => a.attrIndex - b.attrIndex)
        .map((a) => ({ ...a }))

      const currentIndex = equipmentAttrs.findIndex((a) => a.attrIndex === attrIndex)

      if (currentIndex === equipmentAttrs.length - 1) return prev

      // Swap positions in the sorted array
      const temp = equipmentAttrs[currentIndex]
      equipmentAttrs[currentIndex] = equipmentAttrs[currentIndex + 1]
      equipmentAttrs[currentIndex + 1] = temp

      // Reassign attrIndex values sequentially
      equipmentAttrs.forEach((attr, idx) => {
        attr.attrIndex = idx
      })

      const otherAttrs = prev.filter((a) => a.equipIndex !== equipIndex)
      return [...otherAttrs, ...equipmentAttrs].sort((a, b) => a.equipIndex - b.equipIndex)
    })
  }, [])

  const deleteAttribute = useCallback((equipIndex: number, attrIndex: number) => {
    setAttributes((prev) => {
      const filtered = prev.filter((a) => !(a.equipIndex === equipIndex && a.attrIndex === attrIndex))

      return filtered.map((attr) => {
        if (attr.equipIndex === equipIndex && attr.attrIndex > attrIndex) {
          return { ...attr, attrIndex: attr.attrIndex - 1 }
        }
        return attr
      })
    })
  }, [])

  const addAttribute = useCallback(
    (equipIndex: number) => {
      setAttributes((prev) => {
        const equipmentAttrs = prev.filter((a) => a.equipIndex === equipIndex)
        const maxAttrIndex = equipmentAttrs.length > 0 ? Math.max(...equipmentAttrs.map((a) => a.attrIndex)) : -1
        const equipment = parsedData[equipIndex]
        const itemId = equipment[1]
        const equipmentInfo = equipmentOptions.find((opt) => opt.id === itemId)

        const newAttr = {
          equipIndex,
          attrIndex: maxAttrIndex + 1,
          equipmentName: equipmentInfo?.name || `ID: ${itemId}`,
          attrId: attributeOptions[0]?.id || 1,
          attrName: attributeOptions[0]?.name || "Unknown",
          value: 0,
        }

        return [...prev, newAttr]
      })
    },
    [parsedData, equipmentOptions, attributeOptions],
  )

  const copyToClipboard = useCallback(async () => {
    const exportData = JSON.parse(JSON.stringify(parsedData))

    exportData.forEach((equipment: any[], equipIndex: number) => {
      const equipmentAttrs = attributes
        .filter((a) => a.equipIndex === equipIndex)
        .sort((a, b) => a.attrIndex - b.attrIndex)

      equipment[16] = equipmentAttrs.map((attr) => [attr.attrId, Number.parseInt(attr.value)])
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
  }, [parsedData, attributes, toast])

  const groupedAttributes = useMemo(() => {
    const groups = new Map<number, { equipmentName: string; attributes: any[] }>()

    attributes.forEach((attr) => {
      if (!groups.has(attr.equipIndex)) {
        groups.set(attr.equipIndex, {
          equipmentName: attr.equipmentName,
          attributes: [],
        })
      }
      groups.get(attr.equipIndex)!.attributes.push(attr)
    })

    return groups
  }, [attributes])

  const allGroups = useMemo(() => {
    return Array.from(groupedAttributes.entries())
  }, [groupedAttributes])

  const toggleCard = useCallback((equipIndex: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(equipIndex)) {
        newSet.delete(equipIndex)
      } else {
        newSet.add(equipIndex)
      }
      return newSet
    })
  }, [])

  const expandAll = useCallback(() => {
    setExpandedCards(new Set(Array.from(groupedAttributes.keys())))
  }, [groupedAttributes])

  const collapseAll = useCallback(() => {
    setExpandedCards(new Set())
  }, [])

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
            {allGroups.map(([equipIndex, group]) => (
              <EquipmentCard
                key={equipIndex}
                equipIndex={equipIndex}
                equipmentName={group.equipmentName}
                attributes={group.attributes}
                comboboxOptions={comboboxOptions}
                onUpdate={updateAttribute}
                onMoveUp={moveAttributeUp}
                onMoveDown={moveAttributeDown}
                onDelete={deleteAttribute}
                onAddAttribute={addAttribute}
                isExpanded={expandedCards.has(equipIndex)}
                onToggle={() => toggleCard(equipIndex)}
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
