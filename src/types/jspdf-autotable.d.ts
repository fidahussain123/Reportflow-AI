import { jsPDF } from 'jspdf'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF
  }
}

interface AutoTableOptions {
  startY?: number
  head?: (string | number)[][]
  body?: (string | number)[][]
  theme?: 'striped' | 'grid' | 'plain'
  headStyles?: {
    fillColor?: number[]
    textColor?: number[]
    fontStyle?: string
  }
  styles?: {
    fontSize?: number
    cellPadding?: number
  }
  margin?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
}
