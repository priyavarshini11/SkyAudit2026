/** SkyAudit Backend API Client */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Milestone {
  name: string;
  expected_date: string;
  completed?: boolean;
  description?: string;
}

export interface Project {
  project_id: string;
  project_name: string;
  project_type: string;
  location_text: string;
  start_date: string;
  expected_completion: string;
  project_length_km?: number;
  budget_allocated?: string;
  contractor_name?: string;
  milestones: Milestone[];
  geometry?: any;
  corridor_geometry?: any;
  document_path?: string;
  has_imagery: boolean;
  observation_count: number;
  created_at?: string;
}

export interface SatelliteObservation {
  id: string;
  date: string;
  source: string;
  cloud_cover: number;
  resolution_m: number;
  bands: string[];
  file_path?: string;
  preview_url?: string;
  mean_ndvi?: number;
  mean_surface_reflectance?: number;
  corridor_coverage_pct: number;
}

export interface EvidenceTimelineItem {
  date: string;
  phase: string;
  title: string;
  description: string;
  observation_id?: string;
  change_level: string;
  metrics: Record<string, number>;
  key_findings: string[];
}

export interface DiscrepancyResult {
  status: string;
  status_category: "on_track" | "potential_discrepancy" | "critical_discrepancy" | "insufficient_evidence";
  severity: "low" | "medium" | "high" | "critical";
  discrepancy_gap_pct: number;
  explanation: string;
  recommendations: string[];
}

export interface ChangeMetrics {
  spatial_change_score: number;
  temporal_consistency: number;
  construction_feature_score: number;
  milestone_alignment: number;
  image_quality: number;
  ndvi_drop_score: number;
  surface_reflectance_score: number;
}

export interface ProgressBreakdown {
  vegetation_clearance_contribution?: number;
  surface_disturbance_contribution?: number;
  corridor_continuity_contribution?: number;
  built_paved_signal_contribution?: number;
  temporal_consistency_contribution?: number;
  spatial_change_contribution?: number;
  construction_feature_contribution?: number;
  milestone_alignment_contribution?: number;
  formula_used: string;
}

export interface ConfidenceBreakdown {
  image_quality_weight: number;
  observation_coverage_weight: number;
  temporal_consistency_weight: number;
  indicator_agreement_weight: number;
  formula_used: string;
}

export interface FullAnalysisResponse {
  project_id: string;
  project_name: string;
  analyzed_at: string;
  expected_progress: number;
  observable_progress: number;
  confidence: number;
  discrepancy: DiscrepancyResult;
  metrics: ChangeMetrics;
  progress_breakdown: ProgressBreakdown;
  confidence_breakdown: ConfidenceBreakdown;
  observations: SatelliteObservation[];
  timeline: EvidenceTimelineItem[];
  corridor_geojson?: any;
  change_heatmap_url?: string;
  explanation: string;
}

export interface EvidenceReport {
  project_id: string;
  project_name: string;
  generated_at: string;
  expected_progress_pct: number;
  observable_progress_pct: number;
  confidence_score_pct: number;
  status: string;
  status_category: string;
  executive_summary: string;
  evidence_breakdown: string[];
  timeline: EvidenceTimelineItem[];
  observations_used: SatelliteObservation[];
  disclaimer: string;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export async function fetchProject(projectId: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

export async function runAnalysis(projectId: string): Promise<FullAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function fetchLatestAnalysis(projectId: string): Promise<FullAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/analysis`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch latest analysis");
  return res.json();
}

export async function fetchReport(projectId: string): Promise<EvidenceReport> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/report`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch report");
  return res.json();
}

export async function extractDocument(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/projects/extract-document`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to extract document");
  return res.json();
}

export async function createProject(payload: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}


export interface GovernmentProjectRecord {
  tender_id: string;
  project_name: string;
  authority: string;
  state: string;
  corridor_name: string;
  contractor_name: string;
  award_date: string;
  target_completion_date: string;
  project_length_km: number;
  budget_allocated: string;
  status: string;
  lane_count: number;
  start_coordinates: [number, number];
  end_coordinates: [number, number];
  milestones: Milestone[];
  source_portal: string;
  dpr_summary: string;
}

export async function searchGovernmentProjects(params?: {
  query?: string;
  state?: string;
  authority?: string;
  status?: string;
}): Promise<GovernmentProjectRecord[]> {
  const queryParams = new URLSearchParams();
  if (params?.query) queryParams.set("query", params.query);
  if (params?.state) queryParams.set("state", params.state);
  if (params?.authority) queryParams.set("authority", params.authority);
  if (params?.status) queryParams.set("status", params.status);

  const url = `${API_BASE}/api/projects/portal/search?${queryParams.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to search government projects portal");
  return res.json();
}

export async function fetchPortalStates(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/api/projects/portal/states`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch portal states");
  return res.json();
}

export async function importGovernmentProject(tenderId: string, customProjectId?: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects/portal/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tender_id: tenderId, custom_project_id: customProjectId })
  });
  if (!res.ok) throw new Error("Failed to import government project");
  return res.json();
}



