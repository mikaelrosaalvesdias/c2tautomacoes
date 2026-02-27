export type GenericRecord = Record<string, unknown>;

const ID_KEYS = ["Id", "id", "ID"];

export function getRecordId(record: GenericRecord): string {
  for (const key of ID_KEYS) {
    const value = record[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }
  return "";
}

export function getField(record: GenericRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "";
}

export function formatDateTime(value: unknown): string {
  if (!value) {
    return "-";
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

export function containsText(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

export function getDateValue(record: GenericRecord): Date | null {
  const value =
    getField(record, ["created_at", "createdAt", "data", "date", "timestamp"]) ||
    getField(record, ["updated_at", "updatedAt"]);

  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function isCancelAction(record: GenericRecord): boolean {
  const action = getField(record, ["acao", "action"]);
  return action.toLowerCase().includes("cancel");
}

/** Extract the empresa (company) field from a record. Returns lower-cased value. */
export function getRecordEmpresa(record: GenericRecord): string {
  const value = getField(record, ["empresa", "Empresa", "company", "Company", "client", "cliente"]);
  return value.toLowerCase().trim();
}
