import { useCallback, useRef, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { countWords } from '../lib/wordCount';
import * as versionsApi from '../lib/api/versions';

const DEBOUNCE_MS = 500;
const VERSION_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function useAutoSave(projectId: string, chapterId: string, sceneId: string) {
  const updateSceneContent = useProjectStore((s) => s.updateSceneContent);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef<string | null>(null);
  const lastVersionTimeRef = useRef<number>(Date.now());
  const editCountRef = useRef(0);

  const createVersionIfNeeded = useCallback((content: string, forceLabel?: string) => {
    const now = Date.now();
    const elapsed = now - lastVersionTimeRef.current;
    if (elapsed >= VERSION_INTERVAL_MS || forceLabel) {
      lastVersionTimeRef.current = now;
      const wc = countWords(content);
      versionsApi.createVersion(
        sceneId,
        projectId,
        content,
        wc,
        forceLabel
      ).catch(() => {
        // Silent fail for version creation
      });
    }
  }, [sceneId, projectId]);

  const save = useCallback(
    (htmlContent: string) => {
      latestContentRef.current = htmlContent;
      editCountRef.current++;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        updateSceneContent(projectId, chapterId, sceneId, htmlContent);
        latestContentRef.current = null;
        // Check if we should auto-version
        createVersionIfNeeded(htmlContent);
      }, DEBOUNCE_MS);
    },
    [projectId, chapterId, sceneId, updateSceneContent, createVersionIfNeeded]
  );

  const flush = useCallback((manualSave?: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (latestContentRef.current !== null) {
      updateSceneContent(projectId, chapterId, sceneId, latestContentRef.current);
      if (manualSave) {
        createVersionIfNeeded(latestContentRef.current, 'Sauvegarde manuelle');
      }
      latestContentRef.current = null;
    }
  }, [projectId, chapterId, sceneId, updateSceneContent, createVersionIfNeeded]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { save, flush };
}
