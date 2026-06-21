export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string;
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: '0' | '1';
  contract_type?: string;
  created: string;
  category: { tag: string; label: string };
};

export async function searchJobs(
  jobTitle: string,
  location: string,
  country: string = 'us'
): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID!,
    app_key: process.env.ADZUNA_APP_KEY!,
    what: jobTitle,
    category: 'it-jobs', // always filter to IT jobs
    results_per_page: '10',
    'content-type': 'application/json',
  });

  // Only add where if location is provided
  if (location && location.trim() !== '') {
    params.set('where', location);
  }

  const response = await fetch(
    `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Adzuna API error response:', errorText);
    throw new Error(`Adzuna API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}
