<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isStaff = $user instanceof \App\Models\User;

        $appName = \App\Models\Setting::where('key', 'app_name')->value('value') ?? config('app.name');
        $appLogo = \App\Models\Setting::where('key', 'app_logo')->value('value');
        $appFavicon = \App\Models\Setting::where('key', 'app_favicon')->value('value');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'roles' => $isStaff ? $user->getRoleNames() : [],
                'permissions' => $isStaff ? $user->getAllPermissions()->pluck('name') : [],
                'student' => $request->user('student'),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'global' => [
                'app_name' => $appName,
                'app_logo' => $appLogo,
                'app_favicon' => $appFavicon,
            ],
        ];
    }
}
