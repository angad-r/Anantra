import { ModuleSandbox } from '../../components/module-template/ModuleSandbox';
import { AstronautMentorActivity } from './AstronautMentorActivity';
import { aiMentorData } from './aiMentorData';

export function AiMentorPage() {
  return (
    <ModuleSandbox module={aiMentorData}>
      <AstronautMentorActivity />
    </ModuleSandbox>
  );
}
