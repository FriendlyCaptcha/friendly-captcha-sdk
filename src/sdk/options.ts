export function getSDKDisableEvalPatching(): boolean {
  // We check if the meta tag `frc-disable-eval-patching` is present.
  const m: HTMLMetaElement | null = document.querySelector(`meta[name="frc-disable-eval-patching"]`);
  if (!m) return false;

  return !!m.content;
}

export function getSDKAPIEndpoint(): string | undefined {
  // 1. We check for the meta tag `frc-api-endpoint`
  const m: HTMLMetaElement | null = document.querySelector(`meta[name="frc-api-endpoint"]`);
  if (m) return m.content;

  // 2. We check the current script element for `data-frc-api-endpoint`.
  const cs = document.currentScript;
  if (cs) {
    const endpoint = cs.dataset["frcApiEndpoint"];
    if (endpoint) return endpoint;
  }

  // 3. We search for widgets that specify `data-api-endpoint`.
  const we = document.querySelector(".frc-captcha[data-api-endpoint]") as HTMLElement;
  if (we) {
    const endpoint = we.dataset["apiEndpoint"];
    if (endpoint) return endpoint;
  }

  return undefined;
}
