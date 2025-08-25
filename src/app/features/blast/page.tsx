// src/features/blast/page.tsx
"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Tooltip,
  Collapse,
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Grid v2 (size={{ xs, md }})
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info, ChevronDown, ChevronRight } from "lucide-react";
import TagInput from "./components/tagInput";

/* Types */
type Filters = {
  status?: string[];
  gender?: string[];
  region?: string[];
  industryType?: string[];
  ageMin?: string;
  ageMax?: string;
};
type AudienceRow = { id: number; name: string; filters: any; updatedAt: string };
type TemplateRow = { id: number; name: string; subject: string; emailBody: string; waBody: string; updatedAt: string };
type PreviewResp = {
  data: {
    total: number;
    withEmail: number;
    withWhatsApp: number;
    sample: { id: number; name?: string; email?: string; phone?: string }[];
  };
};

/* Utils */
const toStrArr = (v: any): string[] => (Array.isArray(v) ? v.map(String).filter(Boolean) : []);
const toStrOrEmpty = (v: any) => (v == null ? "" : String(v));

export default function BlastFeaturePage() {
  const qc = useQueryClient();

  // Tabs
  const [tab, setTab] = useState(0);

  // Filters
  const [status, setStatus] = useState<string[]>([]);
  const [gender, setGender] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filters: Filters = useMemo(
    () => ({ status, gender, region, industryType: industry, ageMin: ageMin || undefined, ageMax: ageMax || undefined }),
    [status, gender, region, industry, ageMin, ageMax]
  );

  // Saved data
  const audQ = useQuery({
    queryKey: ["audiences"],
    queryFn: async () => {
      const r = await fetch("/api/blast/audiences");
      if (!r.ok) throw new Error("Failed to load audiences");
      const j = await r.json();
      return (j.data as AudienceRow[]) ?? [];
    },
  });

  const tplQ = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const r = await fetch("/api/blast/templates");
      if (!r.ok) throw new Error("Failed to load templates");
      const j = await r.json();
      return (j.data as TemplateRow[]) ?? [];
    },
  });

  const [selectedAudienceId, setSelectedAudienceId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const applyAudience = (a: AudienceRow) => {
    const f = a.filters ?? {};
    setStatus(toStrArr(f.status));
    setGender(toStrArr(f.gender));
    setRegion(toStrArr(f.region));
    setIndustry(toStrArr(f.industryType));
    setAgeMin(toStrOrEmpty(f.ageMin));
    setAgeMax(toStrOrEmpty(f.ageMax));
    setSelectedAudienceId(a.id);
  };

  // Channels + content
  const [sendEmail, setSendEmail] = useState(true);
  const [sendWhatsApp, setSendWhatsApp] = useState(false);
  const [subject, setSubject] = useState("");
  const [emailBody, setEmailBody] = useState("Hi {name},\n\n");
  const [waBody, setWaBody] = useState("Hi {name}, ");

  const applyTemplate = (t: TemplateRow) => {
    setSubject(t.subject || "");
    setEmailBody(t.emailBody || "");
    setWaBody(t.waBody || "");
    setSelectedTemplateId(t.id);
  };

  // Mutations
  const saveAudience = useMutation({
    mutationFn: async (payload: { name: string; filters: any }) => {
      const r = await fetch("/api/blast/audiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audiences"] }),
  });

  const deleteAudience = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/blast/audiences/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audiences"] }),
  });

  const saveTemplate = useMutation({
    mutationFn: async (payload: { name: string; subject: string; emailBody: string; waBody: string }) => {
      const r = await fetch("/api/blast/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/blast/templates/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });

  const preview = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/blast/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters }),
      });
      if (!r.ok) throw new Error(await r.text());
      return (await r.json()) as PreviewResp;
    },
  });

  const runPreview = () =>
    preview.mutate(undefined, {
      onSuccess: () => ok("Preview updated"),
      onError: (e: any) => err(String(e.message || e)),
    });

  const send = useMutation({
    mutationFn: async () => {
      if (!sendEmail && !sendWhatsApp) throw new Error("Pick at least one channel.");
      if (sendEmail && !subject.trim()) throw new Error("Email subject is required.");
      const r = await fetch("/api/blast/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audienceId: selectedAudienceId ?? undefined,
          templateId: selectedTemplateId ?? undefined,
          channels: { email: sendEmail, whatsapp: sendWhatsApp },
          filters,
          subject,
          emailBody,
          waBody,
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      return (await r.json()) as { ok: true; total: number; batches: number; jobId: number };
    },
  });

  // Toast + dialogs
  const [saveAudienceOpen, setSaveAudienceOpen] = useState(false);
  const [saveAudienceName, setSaveAudienceName] = useState("");
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const ok = (m: string) => setToast({ type: "success", msg: m });
  const err = (m: string) => setToast({ type: "error", msg: m });

  // DataGrid
  const previewCols: GridColDef[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Name", flex: 1, minWidth: 140, valueGetter: (p) => p.row?.name ?? "" },
    { field: "email", headerName: "Email", flex: 1, minWidth: 160, valueGetter: (p) => p.row?.email ?? "" },
    { field: "phone", headerName: "Phone", flex: 1, minWidth: 130, valueGetter: (p) => p.row?.phone ?? "" },
  ];

  const activeFilterChips = [
    ...status.map((x) => ({ k: "Status", v: x })),
    ...region.map((x) => ({ k: "Region", v: x })),
    ...industry.map((x) => ({ k: "Industry", v: x })),
    ...(showAdvanced ? gender.map((x) => ({ k: "Gender", v: x })) : []),
    ...(showAdvanced && ageMin ? [{ k: "Age ≥", v: ageMin }] : []),
    ...(showAdvanced && ageMax ? [{ k: "Age ≤", v: ageMax }] : []),
  ];

  return (
    <Box className="space-y-4">
      <Typography variant="h4">Blast (Email / WhatsApp)</Typography>

      <Paper className="p-0" variant="outlined" sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} indicatorColor="primary" textColor="primary">
          <Tab label="1. Audience" />
          <Tab label="2. Message" />
          <Tab label="3. Review & Send" />
        </Tabs>
        <Divider />
        <Box className="p-6">
          {/* Tab 1 */}
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Typography variant="h6">Who to send to</Typography>
                    <Tooltip title="Pick a group to target. Save your selection for reuse.">
                      <span className="inline-flex"><Info size={16} /></span>
                    </Tooltip>
                  </div>

                  {/* Simple filters */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TagInput label="Status" value={status} onChange={setStatus} placeholder="ACTIVE, INACTIVE, DECEASED" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TagInput label="Region" value={region} onChange={setRegion} placeholder="Kuching, Miri" />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TagInput label="Industry" value={industry} onChange={setIndustry} placeholder="Construction, Oil & Gas" />
                    </Grid>
                  </Grid>

                  {/* Advanced */}
                  <Button
                    size="small"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="mt-3"
                    startIcon={showAdvanced ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  >
                    {showAdvanced ? "Hide advanced filters" : "Show advanced filters"}
                  </Button>

                  <Collapse in={showAdvanced} unmountOnExit>
                    <Divider className="my-3" />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TagInput label="Gender" value={gender} onChange={setGender} placeholder="M, F" />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField label="Age ≥" type="number" fullWidth value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 6, md: 3 }}>
                        <TextField label="Age ≤" type="number" fullWidth value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                      </Grid>
                    </Grid>
                  </Collapse>

                  {/* Chips */}
                  {activeFilterChips.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {activeFilterChips.map((c, i) => (
                        <Chip key={i} label={`${c.k}: ${c.v}`} size="small" />
                      ))}
                      <Button
                        size="small"
                        onClick={() => {
                          setStatus([]); setGender([]); setRegion([]); setIndustry([]); setAgeMin(""); setAgeMax("");
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button
                      variant="contained"
                      onClick={runPreview}
                      disabled={preview.isPending}
                      startIcon={preview.isPending ? <CircularProgress size={18} /> : undefined}
                    >
                      {preview.isPending ? "Previewing…" : "Preview"}
                    </Button>

                    <Button variant="outlined" onClick={() => setSaveAudienceOpen(true)}>
                      Save as Audience
                    </Button>

                    <FormControl size="small" sx={{ minWidth: 240 }}>
                      <InputLabel id="aud-select">Load Audience</InputLabel>
                      <Select
                        labelId="aud-select"
                        label="Load Audience"
                        value={selectedAudienceId ?? ""}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const row = (audQ.data || []).find((a) => a.id === id);
                          if (row) { applyAudience(row); ok(`Loaded audience: ${row.name}`); } else { setSelectedAudienceId(null); }
                        }}
                      >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {(audQ.data || []).map((a) => (
                          <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedAudienceId && (
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          const id = selectedAudienceId!;
                          deleteAudience.mutate(id, {
                            onSuccess: () => { setSelectedAudienceId(null); ok("Audience deleted"); },
                            onError: (e: any) => err(String(e.message || e)),
                          });
                        }}
                      >
                        Delete Audience
                      </Button>
                    )}

                    <Button onClick={() => setTab(1)}>Next</Button>
                  </div>
                </Paper>

                {/* Preview panel */}
                <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                  <div className="flex items-center gap-2">
                    <Typography variant="subtitle1">Preview</Typography>
                    <Button size="small" onClick={runPreview} startIcon={<Info size={14} />}>Refresh</Button>
                  </div>
                  {preview.data?.data ? (
                    <>
                      <div className="text-sm space-x-4 mt-1">
                        <span>Total: <b>{preview.data.data.total}</b></span>
                        <span>Email-ready: <b>{preview.data.data.withEmail}</b></span>
                        <span>WhatsApp-ready: <b>{preview.data.data.withWhatsApp}</b></span>
                      </div>
                      <div className="mt-2" style={{ height: 260 }}>
                        <DataGrid
                          rows={preview.data.data.sample}
                          columns={previewCols}
                          getRowId={(r) => r.id}
                          hideFooter
                          disableRowSelectionOnClick
                        />
                      </div>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" className="mt-1">
                      No preview yet. Click <b>Preview</b>.
                    </Typography>
                  )}
                </Paper>
              </Grid>

              {/* Right rail */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle1">Saved Audiences</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {audQ.isLoading && <Typography variant="body2">Loading…</Typography>}
                  {!audQ.isLoading && (audQ.data?.length ?? 0) === 0 && (
                    <Typography variant="body2" color="text.secondary">No saved audiences yet.</Typography>
                  )}
                  <div className="space-y-1">
                    {(audQ.data || []).map((a) => (
                      <div key={a.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Chip label={a.name} variant={selectedAudienceId === a.id ? "filled" : "outlined"} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(a.updatedAt).toLocaleString()}
                          </Typography>
                        </div>
                        <div className="flex gap-1">
                          <Button size="small" onClick={() => { applyAudience(a); ok(`Loaded audience: ${a.name}`); }}>
                            Load
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              deleteAudience.mutate(a.id, {
                                onSuccess: () => { if (selectedAudienceId === a.id) setSelectedAudienceId(null); ok("Audience deleted"); },
                                onError: (e: any) => err(String(e.message || e)),
                              })
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 2 */}
          {tab === 1 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>Compose Message</Typography>

                  <div className="flex gap-6">
                    <FormControlLabel control={<Checkbox checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />} label="Email" />
                    <FormControlLabel control={<Checkbox checked={sendWhatsApp} onChange={(e) => setSendWhatsApp(e.target.checked)} />} label="WhatsApp" />
                  </div>

                  {sendEmail && (
                    <Box className="space-y-3 mt-2">
                      <TextField label="Email Subject" fullWidth value={subject} onChange={(e) => setSubject(e.target.value)} />
                      <TextField
                        label="Email Body (supports {name})"
                        fullWidth
                        multiline
                        minRows={6}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                      />
                    </Box>
                  )}

                  {sendWhatsApp && (
                    <Box className="space-y-3 mt-2">
                      <TextField
                        label="WhatsApp Text (supports {name})"
                        fullWidth
                        multiline
                        minRows={4}
                        value={waBody}
                        onChange={(e) => setWaBody(e.target.value)}
                      />
                    </Box>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button variant="outlined" onClick={() => setSaveTemplateOpen(true)}>
                      Save as Template
                    </Button>

                    <FormControl size="small" sx={{ minWidth: 240 }}>
                      <InputLabel id="tpl-select">Load Template</InputLabel>
                      <Select
                        labelId="tpl-select"
                        label="Load Template"
                        value={selectedTemplateId ?? ""}
                        onChange={(e) => {
                          const id = Number(e.target.value);
                          const row = (tplQ.data || []).find((t) => t.id === id);
                          if (row) { applyTemplate(row); ok(`Loaded template: ${row.name}`); } else { setSelectedTemplateId(null); }
                        }}
                      >
                        <MenuItem value=""><em>None</em></MenuItem>
                        {(tplQ.data || []).map((t) => (
                          <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedTemplateId && (
                      <Button
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          const id = selectedTemplateId!;
                          deleteTemplate.mutate(id, {
                            onSuccess: () => { setSelectedTemplateId(null); ok("Template deleted"); },
                            onError: (e: any) => err(String(e.message || e)),
                          });
                        }}
                      >
                        Delete Template
                      </Button>
                    )}

                    <Button onClick={() => setTab(2)}>Next</Button>
                  </div>
                </Paper>

                <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Tips</Typography>
                  <div className="text-sm text-gray-300">Use <code>{"{name}"}</code> inside message bodies.</div>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle1">Saved Templates</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {tplQ.isLoading && <Typography variant="body2">Loading…</Typography>}
                  {!tplQ.isLoading && (tplQ.data?.length ?? 0) === 0 && (
                    <Typography variant="body2" color="text.secondary">No templates yet.</Typography>
                  )}
                  <div className="space-y-1">
                    {(tplQ.data || []).map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Chip label={t.name} variant={selectedTemplateId === t.id ? "filled" : "outlined"} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(t.updatedAt).toLocaleString()}
                          </Typography>
                        </div>
                        <div className="flex gap-1">
                          <Button size="small" onClick={() => { applyTemplate(t); ok(`Loaded template: ${t.name}`); }}>
                            Load
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              deleteTemplate.mutate(t.id, {
                                onSuccess: () => { if (selectedTemplateId === t.id) setSelectedTemplateId(null); ok("Template deleted"); },
                                onError: (e: any) => err(String(e.message || e)),
                              })
                            }
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* Tab 3 */}
          {tab === 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6">Review</Typography>
                  <div className="text-sm space-y-1 mt-1">
                    <div>Channels: <b>{[sendEmail ? "Email" : null, sendWhatsApp ? "WhatsApp" : null].filter(Boolean).join(", ") || "None"}</b></div>
                    {selectedAudienceId && <div>Audience: <b>#{selectedAudienceId}</b></div>}
                    {selectedTemplateId && <div>Template: <b>#{selectedTemplateId}</b></div>}
                    {sendEmail && (
                      <>
                        <div>Email Subject: <b>{subject || "(empty)"}</b></div>
                        <div>Email Body:</div>
                        <pre className="bg-gray-100 p-2 rounded overflow-auto">{emailBody || "(empty)"}</pre>
                      </>
                    )}
                    {sendWhatsApp && (
                      <>
                        <div>WhatsApp Body:</div>
                        <pre className="bg-gray-100 p-2 rounded overflow-auto">{waBody || "(empty)"}</pre>
                      </>
                    )}
                  </div>
                </Paper>

                <Box className="mt-4 flex gap-2">
                  <Button onClick={() => setTab(1)}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={() =>
                      send.mutate(undefined, {
                        onSuccess: (r) => ok(`Queued: ${r.total} recipients (job #${r.jobId}).`),
                        onError: (e: any) => err(String(e.message || e)),
                      })
                    }
                    disabled={send.isPending}
                    startIcon={send.isPending ? <CircularProgress size={18} /> : undefined}
                  >
                    {send.isPending ? "Sending…" : "Send"}
                  </Button>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 5 }}>
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <div className="flex items-center justify-between">
                    <Typography variant="subtitle1">Latest Preview</Typography>
                    <Button size="small" onClick={runPreview}>Refresh</Button>
                  </div>
                  {preview.data?.data ? (
                    <>
                      <div className="text-sm space-x-4">
                        <span>Total: <b>{preview.data.data.total}</b></span>
                        <span>Email-ready: <b>{preview.data.data.withEmail}</b></span>
                        <span>WhatsApp-ready: <b>{preview.data.data.withWhatsApp}</b></span>
                      </div>
                      <div className="mt-2" style={{ height: 260 }}>
                        <DataGrid
                          rows={preview.data.data.sample}
                          columns={previewCols}
                          getRowId={(r) => r.id}
                          hideFooter
                          disableRowSelectionOnClick
                        />
                      </div>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No preview yet. Go to Audience and click <b>Preview</b>.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Save Audience */}
      <Dialog open={saveAudienceOpen} onClose={() => setSaveAudienceOpen(false)}>
        <DialogTitle>Save Audience</DialogTitle>
        <DialogContent>
          <TextField label="Audience name" fullWidth autoFocus value={saveAudienceName} onChange={(e) => setSaveAudienceName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveAudienceOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              saveAudience.mutate(
                { name: saveAudienceName || "Untitled Audience", filters },
                {
                  onSuccess: () => { setSaveAudienceOpen(false); setSaveAudienceName(""); ok("Audience saved"); },
                  onError: (e: any) => err(String(e.message || e)),
                }
              );
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Template */}
      <Dialog open={saveTemplateOpen} onClose={() => setSaveTemplateOpen(false)}>
        <DialogTitle>Save Template</DialogTitle>
        <DialogContent>
          <TextField label="Template name" fullWidth autoFocus value={saveTemplateName} onChange={(e) => setSaveTemplateName(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              saveTemplate.mutate(
                { name: saveTemplateName || "Untitled Template", subject, emailBody, waBody },
                {
                  onSuccess: () => { setSaveTemplateOpen(false); setSaveTemplateName(""); ok("Template saved"); },
                  onError: (e: any) => err(String(e.message || e)),
                }
              );
            }}
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={!!toast} autoHideDuration={3000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        {toast && <Alert severity={toast.type} onClose={() => setToast(null)}>{toast.msg}</Alert>}
      </Snackbar>
    </Box>
  );
}
