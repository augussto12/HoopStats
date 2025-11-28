import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export function useGoBack() {
  const location = inject(Location);
  return () => location.back();
}

export function goPageBack() {
  const router = inject(Router);
  return () => router.navigate(['../']);
}