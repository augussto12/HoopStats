import { Location } from '@angular/common';
import { inject } from '@angular/core';

export function useGoBack() {
  const location = inject(Location);
  return () => location.back();
}
