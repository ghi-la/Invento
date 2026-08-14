"use client";
import { useMemo, useState } from "react";
import Papa from "papaparse";
import { useTranslation } from "react-i18next";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  LinearProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const FIELDS = [
  { key: "name", labelKey: "import.fields.name", required: true },
  { key: "sku", labelKey: "import.fields.sku" },
  { key: "barcode", labelKey: "import.fields.barcode" },
  { key: "category", labelKey: "import.fields.category" },
  { key: "quantity", labelKey: "import.fields.quantity" },
  { key: "unit", labelKey: "import.fields.unit" },
  { key: "minStockLevel", labelKey: "import.fields.minStockLevel" },
  { key: "location", labelKey: "import.fields.location" },
  { key: "costPrice", labelKey: "import.fields.costPrice" },
  { key: "sellPrice", labelKey: "import.fields.sellPrice" },
  { key: "description", labelKey: "import.fields.description" },
];

const GUESS_PATTERNS = {
  name: /^(product|item|name|title|description short)/i,
  sku: /(sku|item.?code|product.?code|^code$)/i,
  barcode: /(barcode|upc|ean|gtin)/i,
  category: /(category|type|group|department)/i,
  quantity: /(qty|quantity|stock|on.?hand|count)/i,
  unit: /(unit|uom)/i,
  minStockLevel: /(min|reorder|threshold|low.?stock)/i,
  location: /(location|bin|shelf|aisle|warehouse.?spot)/i,
  costPrice: /(cost|purchase.?price|buy.?price)/i,
  sellPrice: /(sell|sale|retail|price)$/i,
  description: /(description|notes|details)/i,
};

function guessMapping(headers) {
  const mapping = {};
  const used = new Set();
  for (const field of Object.keys(GUESS_PATTERNS)) {
    const match = headers.find((h) => !used.has(h) && GUESS_PATTERNS[field].test(h));
    if (match) {
      mapping[field] = match;
      used.add(match);
    }
  }
  return mapping;
}

export default function CsvImportWizard({ warehouseId }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState("");
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [mode, setMode] = useState("upsert");
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleFile(file) {
    setError("");
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        if (!res.data.length) {
          setError(t("import.errors.emptyFile"));
          return;
        }
        const hdrs = res.meta.fields || [];
        setHeaders(hdrs);
        setRows(res.data);
        setMapping(guessMapping(hdrs));
        setStep(1);
      },
      error: () => setError(t("import.errors.invalidFile")),
    });
  }

  const mappedPreview = useMemo(
    () => rows.slice(0, 5).map((r) => mapRow(r, mapping)),
    [rows, mapping]
  );

  async function handleImport() {
    setImporting(true);
    setError("");
    const allMapped = rows.map((r) => mapRow(r, mapping)).filter((r) => r.name?.trim());
    const chunkSize = 1000;
    let created = 0,
      updated = 0,
      categoriesCreated = 0;
    try {
      for (let i = 0; i < allMapped.length; i += chunkSize) {
        const chunk = allMapped.slice(i, i + chunkSize);
        const res = await fetch(`/api/warehouses/${warehouseId}/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows: chunk, mode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || t("import.errors.importFailed"));
        created += data.created;
        updated += data.updated;
        categoriesCreated += data.categoriesCreated;
        setProgress(Math.round(((i + chunk.length) / allMapped.length) * 100));
      }
      setResult({ created, updated, categoriesCreated, skipped: rows.length - allMapped.length });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setStep(0);
    setFileName("");
    setHeaders([]);
    setRows([]);
    setMapping({});
    setResult(null);
    setProgress(0);
  }

  return (
    <Box>
      <Stepper activeStep={step} sx={{ mb: 3 }} alternativeLabel>
        <Step>
          <StepLabel>{t("import.steps.upload")}</StepLabel>
        </Step>
        <Step>
          <StepLabel>{t("import.steps.mapColumns")}</StepLabel>
        </Step>
        <Step>
          <StepLabel>{t("import.steps.review")}</StepLabel>
        </Step>
        <Step>
          <StepLabel>{t("import.steps.done")}</StepLabel>
        </Step>
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {step === 0 && (
        <Card>
          <CardContent sx={{ py: 6 }}>
            <Box
              component="label"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                py: 6,
                cursor: "pointer",
                "&:hover": { borderColor: "warning.main" },
              }}
            >
              <UploadFileIcon sx={{ fontSize: 40, color: "text.secondary" }} />
              <Typography fontWeight={600}>{t("import.uploadPrompt")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("import.uploadHint")}
              </Typography>
              <input
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
              {t("import.matchColumnsTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("import.matchColumnsSubtitle", { fileName, count: rows.length })}
            </Typography>
            <Stack spacing={1.5}>
              {FIELDS.map((f) => (
                <Stack key={f.key} direction="row" alignItems="center" spacing={2}>
                  <Typography sx={{ width: 170, flexShrink: 0 }}>
                    {t(f.labelKey)}
                    {f.required && " *"}
                  </Typography>
                  <Select
                    size="small"
                    fullWidth
                    value={mapping[f.key] || ""}
                    onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value }))}
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>{t("import.dontImport")}</em>
                    </MenuItem>
                    {headers.map((h) => (
                      <MenuItem key={h} value={h}>
                        {h}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <Button onClick={reset}>{t("common.back")}</Button>
              <Button variant="contained" disabled={!mapping.name} onClick={() => setStep(2)}>
                {t("common.continue")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              {t("import.previewTitle")}
            </Typography>
            <Paper variant="outlined" sx={{ overflowX: "auto", mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {FIELDS.filter((f) => mapping[f.key]).map((f) => (
                      <TableCell key={f.key}>{t(f.labelKey)}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mappedPreview.map((r, i) => (
                    <TableRow key={i}>
                      {FIELDS.filter((f) => mapping[f.key]).map((f) => (
                        <TableCell key={f.key}>{String(r[f.key] ?? "")}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t("import.previewCount", { shown: mappedPreview.length, total: rows.length })}
            </Typography>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              {t("import.conflictTitle")}
            </Typography>
            <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
              <FormControlLabel value="upsert" control={<Radio />} label={t("import.modeUpsert")} />
              <FormControlLabel value="create" control={<Radio />} label={t("import.modeCreate")} />
            </RadioGroup>

            {importing && <LinearProgress variant="determinate" value={progress} sx={{ mt: 2 }} />}

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
              <Button onClick={() => setStep(1)} disabled={importing}>
                {t("common.back")}
              </Button>
              <Button variant="contained" disabled={importing} onClick={handleImport}>
                {importing
                  ? t("import.importingProgress", { progress })
                  : t("import.importButton", { count: rows.length })}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 3 && result && (
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {t("import.completeTitle")}
            </Typography>
            <Typography color="text.secondary">
              {result.categoriesCreated
                ? t("import.completeSummaryWithCategories", {
                    created: result.created,
                    updated: result.updated,
                    categories: result.categoriesCreated,
                  })
                : t("import.completeSummary", { created: result.created, updated: result.updated })}
            </Typography>
            {result.skipped > 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                {t("import.skippedWarning", { count: result.skipped })}
              </Typography>
            )}
            <Button variant="contained" sx={{ mt: 3 }} onClick={reset}>
              {t("import.importAnother")}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function mapRow(row, mapping) {
  const out = {};
  for (const [field, header] of Object.entries(mapping)) {
    if (!header) continue;
    out[field] = row[header];
  }
  return out;
}
