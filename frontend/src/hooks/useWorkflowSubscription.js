import { useEffect, useRef } from "react";
import socketService from "../services/socketService";
import useAuthStore from "../store/authStore";

/**
 * useWorkflowSubscription
 * 
 * @param {Object} options
 * @param {string} options.entityType - e.g., "order", "appointment", "diagnostic", "notification"
 * @param {Function} options.onUpdate - Callback executed when a relevant update is received
 */
const useWorkflowSubscription = ({ entityType, onUpdate } = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleWorkflowUpdate = (data) => {
      if (entityType && data.entityType !== entityType) return;
      
      if (onUpdateRef.current) {
        onUpdateRef.current(data);
      }
    };

    socketService.on("workflow_update", handleWorkflowUpdate);

    return () => {
      socketService.off("workflow_update", handleWorkflowUpdate);
    };
  }, [isAuthenticated, entityType]);
};

export default useWorkflowSubscription;
