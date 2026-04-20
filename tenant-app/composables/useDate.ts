export const useDate = () => {
    const DEFAULT_TIMEZONE = 'Asia/Kolkata'

    const formatDisplayDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const formatDisplayDateTime = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return date.toLocaleString('en-IN', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        })
    }

    const formatDisplayTime = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    const toApiDate = (date: any): string => {
        if (!date) return ''
        if (typeof date === 'string') return date
        if (date.toDate && typeof date.toDate === 'function') {
            date = date.toDate()
        }
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const toApiTime = (time: any): string => {
        if (!time) return ''
        if (typeof time === 'string') return time.substring(0, 5)
        if (time.toDate && typeof time.toDate === 'function') {
            time = time.toDate()
        }
        const d = new Date(time)
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    }

    const toApiDateTime = (date: any): string => {
        if (!date) return ''
        if (typeof date === 'string') return date
        const d = new Date(date)
        return d.toISOString()
    }

    return {
        toApiDate,
        toApiTime,
        toApiDateTime,
        formatDisplayDate,
        formatDisplayDateTime,
        formatDisplayTime,
        DEFAULT_TIMEZONE
    }
}
