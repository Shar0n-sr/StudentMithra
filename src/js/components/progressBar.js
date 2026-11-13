export const progressBar=(value)=>`<div class="progress-track"><div class="progress-fill" style="width:${Math.max(0,Math.min(100,Number(value)||0))}%"></div></div>`;
