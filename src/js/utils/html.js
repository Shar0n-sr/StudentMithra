export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const option=(value,label,current)=>`<option value="${esc(value)}" ${String(current)===String(value)?'selected':''}>${esc(label)}</option>`;
export const actions=(id,edit='edit',remove='delete')=>`<div class="actions"><button class="icon-btn" data-action="${edit}" data-id="${esc(id)}" aria-label="Edit">✎</button><button class="icon-btn" data-action="${remove}" data-id="${esc(id)}" aria-label="Delete">×</button></div>`;
