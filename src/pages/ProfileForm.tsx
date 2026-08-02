import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Loader2, MapPin, Phone, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService } from '../service/userService';

interface ProfileFormState {
    username: string;
    nickname: string; // stored/sent WITH the leading "@", per backend pattern
    bio: string;
    dob: string; // yyyy-MM-dd for <input type="date">
    phone: string;
    gender: '' | 'M' | 'F';
    address: string;
}

const emptyForm: ProfileFormState = {
    username: '',
    nickname: '',
    bio: '',
    dob: '',
    phone: '',
    gender: '',
    address: '',
};

// Mirrors the backend @Pattern constraints so users see errors before submitting.
const NICKNAME_REGEX = /^@[A-Za-z0-9_]{2,30}$/;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

const ProfileForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState<ProfileFormState>(emptyForm);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormState, string>>>({});

    useEffect(() => {
        const fetchCurrentProfile = async () => {
            try {
                setLoading(true);
                const response = await userService.getProfile();
                if (response.success && response.data) {
                    const p = response.data;
                    setForm({
                        username: p.username || '',
                        nickname: p.nickname ? (p.nickname.startsWith('@') ? p.nickname : `@${p.nickname}`) : '',
                        bio: p.bio || '',
                        dob: p.dob || '',
                        phone: p.phone || '',
                        gender: (p.gender as 'M' | 'F') || '',
                        address: p.address || '',
                    });
                }
            } catch (err: any) {
                console.error('Failed to load profile:', err.message);
                toast.error('Could not load your profile');
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentProfile();
    }, []);

    const handleChange = (field: keyof ProfileFormState, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleNicknameChange = (raw: string) => {
        // Keep the leading "@" glued on so users can't accidentally delete it.
        let next = raw.startsWith('@') ? raw : `@${raw.replace(/^@+/, '')}`;
        next = next.replace(/[^@A-Za-z0-9_]/g, '');
        handleChange('nickname', next);
    };

    const validate = (): boolean => {
        const next: Partial<Record<keyof ProfileFormState, string>> = {};

        if (form.username.trim().length < 3 || form.username.trim().length > 50) {
            next.username = 'Username must be 3–50 characters';
        }
        if (form.nickname && !NICKNAME_REGEX.test(form.nickname)) {
            next.nickname = 'Nickname must start with @ and use only letters, numbers, or underscores (2–30 chars)';
        }
        if (form.bio.length > 500) {
            next.bio = 'Bio must be 500 characters or fewer';
        }
        if (form.dob && new Date(form.dob) >= new Date()) {
            next.dob = 'Date of birth must be in the past';
        }
        if (form.phone && !PHONE_REGEX.test(form.phone)) {
            next.phone = 'Enter a valid phone number (8–15 digits, optional +)';
        }
        if (form.address.length > 255) {
            next.address = 'Address must be 255 characters or fewer';
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            toast.error('Please fix the highlighted fields');
            return;
        }

        try {
            setSaving(true);
            const response = await userService.updateProfile({
                username: form.username.trim(),
                nickname: form.nickname || undefined,
                bio: form.bio.trim() || undefined,
                dob: form.dob || undefined,
                phone: form.phone.trim() || undefined,
                gender: form.gender || undefined,
                address: form.address.trim() || undefined,
            });

            if (response.success && response.data) {
                toast.success('Profile updated!');
                const nicknameForRoute = response.data.nickname?.replace(/^@/, '') || form.nickname.replace(/^@/, '');
                navigate(`/profile/${nicknameForRoute}`);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    // --- Loading state ---
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50">
                <div className="h-48 sm:h-56 bg-zinc-200 animate-pulse" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="px-12 max-w-2xl">
                        <div className="h-5 w-40 bg-zinc-200 rounded-full mt-6 animate-pulse" />
                        <div className="h-4 w-full bg-zinc-200 rounded-full mt-4 animate-pulse" />
                        <div className="h-4 w-full bg-zinc-200 rounded-full mt-3 animate-pulse" />
                        <div className="h-4 w-2/3 bg-zinc-200 rounded-full mt-3 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Content — constrained width with real page padding, matching the profile page */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                {/* Banner — full width, no card wrapper */}
                <div className="h-48 sm:h-56 rounded-b-md bg-gray-200 relative flex items-end">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="absolute top-5 left-4 sm:left-6 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors backdrop-blur-md"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="px-12 pb-6 text-2xl font-bold text-zinc-900">Edit Profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="px-12 pt-6 max-w-2xl flex flex-col gap-5">
                    <p className="text-sm text-zinc-500 -mt-2">
                        Fill in the details you'd like other people to see on your profile.
                    </p>

                    {/* Username */}
                    <div>
                        <label className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5 mb-1.5">
                            <User className="w-4 h-4 text-zinc-400" /> Username
                        </label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => handleChange('username', e.target.value)}
                            placeholder="Your display name"
                            className={`w-full px-4 py-2.5 rounded-md border text-sm outline-none transition-colors bg-white ${errors.username
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-zinc-200 focus:border-indigo-500'
                                }`}
                        />
                        {errors.username && <p className="text-xs text-rose-500 mt-1">{errors.username}</p>}
                    </div>

                    {/* Nickname */}
                    <div>
                        <label className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5 mb-1.5">
                            @ Nickname
                        </label>
                        <input
                            type="text"
                            value={form.nickname}
                            onChange={(e) => handleNicknameChange(e.target.value)}
                            placeholder="@yourname"
                            className={`w-full px-4 py-2.5 rounded-md border text-sm outline-none transition-colors bg-white ${errors.nickname
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-zinc-200 focus:border-indigo-500'
                                }`}
                        />
                        {errors.nickname ? (
                            <p className="text-xs text-rose-500 mt-1">{errors.nickname}</p>
                        ) : (
                            <p className="text-xs text-zinc-400 mt-1">
                                This is how people find your profile — letters, numbers, and underscores only.
                            </p>
                        )}
                    </div>

                    {/* Bio */}
                    <div>
                        <label className="text-sm font-semibold text-zinc-700 mb-1.5 block">Bio</label>
                        <textarea
                            value={form.bio}
                            onChange={(e) => handleChange('bio', e.target.value)}
                            placeholder="Tell people a bit about yourself"
                            rows={3}
                            maxLength={500}
                            className={`w-full px-4 py-2.5 rounded-md border text-sm outline-none transition-colors resize-none bg-white ${errors.bio
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-zinc-200 focus:border-indigo-500'
                                }`}
                        />
                        <div className="flex justify-between mt-1">
                            {errors.bio ? <p className="text-xs text-rose-500">{errors.bio}</p> : <span />}
                            <p className="text-xs text-zinc-400">{form.bio.length}/500</p>
                        </div>
                    </div>

                    {/* Dob + Gender */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5 mb-1.5">
                                <Calendar className="w-4 h-4 text-zinc-400" /> Date of birth
                            </label>
                            <input
                                type="date"
                                value={form.dob}
                                onChange={(e) => handleChange('dob', e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className={`w-full px-4 py-2.5 rounded-md border text-sm outline-none transition-colors bg-white ${errors.dob
                                        ? 'border-rose-400 focus:border-rose-500'
                                        : 'border-zinc-200 focus:border-indigo-500'
                                    }`}
                            />
                            {errors.dob && <p className="text-xs text-rose-500 mt-1">{errors.dob}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-zinc-700 mb-1.5 block">Gender</label>
                            <div className="flex gap-2">
                                {(['M', 'F'] as const).map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => handleChange('gender', g)}
                                        className={`flex-1 py-2.5 rounded-md border text-sm font-medium transition-colors ${form.gender === g
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'bg-white border-zinc-200 text-zinc-600 hover:border-indigo-300'
                                            }`}
                                    >
                                        {g === 'M' ? 'Male' : 'Female'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5 mb-1.5">
                            <Phone className="w-4 h-4 text-zinc-400" /> Phone
                        </label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+855 12 345 678"
                            className={`w-full px-4 py-2.5 rounded-md border text-sm outline-none transition-colors bg-white ${errors.phone
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-zinc-200 focus:border-indigo-500'
                                }`}
                        />
                        {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-sm font-semibold text-zinc-700 flex items-center gap-1.5 mb-1.5">
                            <MapPin className="w-4 h-4 text-zinc-400" /> Address
                        </label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => handleChange('address', e.target.value)}
                            placeholder="City, country"
                            maxLength={255}
                            className={`w-full px-4 py-2.5 rounded-md border text-sm outline-none transition-colors bg-white ${errors.address
                                    ? 'border-rose-400 focus:border-rose-500'
                                    : 'border-zinc-200 focus:border-indigo-500'
                                }`}
                        />
                        {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-2 pb-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-md font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                            className="px-5 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md font-semibold text-sm transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm;